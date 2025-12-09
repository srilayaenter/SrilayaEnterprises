/*
# Inventory Management System

## Overview
Comprehensive inventory management system with stock reservation, low stock alerts, 
automatic stock updates, and expiry date tracking for organic products.

## 1. Products Table Enhancements
Add inventory management fields:
- `min_stock_threshold` (integer): Minimum stock level before alert
- `reserved_stock` (integer): Stock reserved for pending orders
- `expiry_date` (date): Product expiry date for organic items
- `expiry_alert_days` (integer): Days before expiry to trigger alert

## 2. New Tables

### stock_movements
Audit trail for all stock changes:
- `id` (uuid, primary key)
- `product_id` (uuid, references products)
- `movement_type` (text): reserve, release, finalize, adjustment, restock
- `quantity` (integer): Amount of stock moved
- `order_id` (uuid, references orders): Related order if applicable
- `previous_stock` (integer): Stock before movement
- `new_stock` (integer): Stock after movement
- `previous_reserved` (integer): Reserved stock before movement
- `new_reserved` (integer): Reserved stock after movement
- `notes` (text): Additional information
- `created_by` (uuid, references auth.users)
- `created_at` (timestamptz)

### inventory_alerts
Track inventory alerts and warnings:
- `id` (uuid, primary key)
- `product_id` (uuid, references products)
- `alert_type` (text): low_stock, expiring, expired, out_of_stock
- `severity` (text): low, medium, high, critical
- `message` (text): Alert description
- `is_resolved` (boolean): Whether alert has been addressed
- `resolved_at` (timestamptz): When alert was resolved
- `resolved_by` (uuid, references auth.users)
- `created_at` (timestamptz)

## 3. Functions

### get_available_stock(p_product_id)
Calculate available stock (total stock - reserved stock)

### reserve_stock(p_product_id, p_quantity, p_order_id, p_user_id)
Reserve stock for an order, prevent overselling

### release_stock(p_product_id, p_quantity, p_order_id, p_user_id, p_notes)
Release reserved stock (on cancellation)

### finalize_stock(p_product_id, p_quantity, p_order_id, p_user_id)
Finalize stock reduction (on delivery)

### check_low_stock_products()
Get all products below minimum threshold

### check_expiring_products(p_days)
Get products expiring within specified days

### create_inventory_alert(p_product_id, p_alert_type, p_severity, p_message)
Create an inventory alert

### resolve_inventory_alert(p_alert_id, p_user_id)
Mark an alert as resolved

## 4. Triggers

### trigger_check_stock_alerts
After stock changes, check if alerts need to be created

### trigger_check_expiry_alerts
Daily check for expiring products

## 5. Security
- Enable RLS on stock_movements and inventory_alerts
- Admins have full access
- Regular users can view their order-related movements
- Public can view product availability

## 6. Indexes
- Index on product_id for stock_movements
- Index on alert_type and is_resolved for inventory_alerts
- Index on expiry_date for products
*/

-- ============================================================================
-- 1. PRODUCTS TABLE ENHANCEMENTS
-- ============================================================================

-- Add inventory management fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS min_stock_threshold integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS reserved_stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS expiry_date date,
ADD COLUMN IF NOT EXISTS expiry_alert_days integer DEFAULT 30;

-- Add check constraints
ALTER TABLE products 
ADD CONSTRAINT check_reserved_stock_positive CHECK (reserved_stock >= 0),
ADD CONSTRAINT check_reserved_not_exceed_stock CHECK (reserved_stock <= stock),
ADD CONSTRAINT check_min_threshold_positive CHECK (min_stock_threshold >= 0);

-- Create index on expiry_date for faster queries
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_stock_levels ON products(stock, reserved_stock);

-- ============================================================================
-- 2. STOCK MOVEMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('reserve', 'release', 'finalize', 'adjustment', 'restock')),
  quantity integer NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  previous_stock integer NOT NULL,
  new_stock integer NOT NULL,
  previous_reserved integer NOT NULL,
  new_reserved integer NOT NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_order_id ON stock_movements(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);

-- Enable RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stock_movements
CREATE POLICY "Admins can view all stock movements" ON stock_movements
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their order-related movements" ON stock_movements
  FOR SELECT TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert stock movements" ON stock_movements
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 3. INVENTORY ALERTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('low_stock', 'expiring', 'expired', 'out_of_stock')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message text NOT NULL,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_type_resolved ON inventory_alerts(alert_type, is_resolved);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_severity ON inventory_alerts(severity) WHERE is_resolved = false;
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_created_at ON inventory_alerts(created_at DESC);

-- Enable RLS
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_alerts
CREATE POLICY "Admins can view all alerts" ON inventory_alerts
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update alerts" ON inventory_alerts
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "System can insert alerts" ON inventory_alerts
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Function to get available stock (total - reserved)
CREATE OR REPLACE FUNCTION get_available_stock(p_product_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stock integer;
  v_reserved integer;
BEGIN
  SELECT stock, reserved_stock INTO v_stock, v_reserved
  FROM products
  WHERE id = p_product_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  RETURN GREATEST(v_stock - v_reserved, 0);
END;
$$;

-- Function to create inventory alert
CREATE OR REPLACE FUNCTION create_inventory_alert(
  p_product_id uuid,
  p_alert_type text,
  p_severity text,
  p_message text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_alert_id uuid;
  v_existing_alert_id uuid;
BEGIN
  -- Check if similar unresolved alert already exists
  SELECT id INTO v_existing_alert_id
  FROM inventory_alerts
  WHERE product_id = p_product_id
    AND alert_type = p_alert_type
    AND is_resolved = false
  LIMIT 1;
  
  IF v_existing_alert_id IS NOT NULL THEN
    RETURN v_existing_alert_id;
  END IF;
  
  -- Create new alert
  INSERT INTO inventory_alerts (product_id, alert_type, severity, message)
  VALUES (p_product_id, p_alert_type, p_severity, p_message)
  RETURNING id INTO v_alert_id;
  
  -- Create notification for admins
  INSERT INTO notifications (user_id, type, title, message, related_id)
  SELECT 
    p.id,
    'inventory',
    'Inventory Alert: ' || p_alert_type,
    p_message,
    p_product_id::text
  FROM profiles p
  WHERE p.role = 'admin';
  
  RETURN v_alert_id;
END;
$$;

-- ============================================================================
-- 5. STOCK MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to reserve stock for an order
CREATE OR REPLACE FUNCTION reserve_stock(
  p_product_id uuid,
  p_quantity integer,
  p_order_id uuid,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock integer;
  v_current_reserved integer;
  v_available integer;
  v_product_name text;
BEGIN
  -- Get current stock levels
  SELECT stock, reserved_stock, name 
  INTO v_current_stock, v_current_reserved, v_product_name
  FROM products
  WHERE id = p_product_id
  FOR UPDATE; -- Lock row to prevent race conditions
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Product not found'
    );
  END IF;
  
  -- Calculate available stock
  v_available := v_current_stock - v_current_reserved;
  
  -- Check if enough stock available
  IF v_available < p_quantity THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', format('Insufficient stock. Available: %s, Requested: %s', v_available, p_quantity),
      'available_stock', v_available
    );
  END IF;
  
  -- Reserve the stock
  UPDATE products
  SET reserved_stock = reserved_stock + p_quantity
  WHERE id = p_product_id;
  
  -- Log the movement
  INSERT INTO stock_movements (
    product_id,
    movement_type,
    quantity,
    order_id,
    previous_stock,
    new_stock,
    previous_reserved,
    new_reserved,
    notes,
    created_by
  ) VALUES (
    p_product_id,
    'reserve',
    p_quantity,
    p_order_id,
    v_current_stock,
    v_current_stock,
    v_current_reserved,
    v_current_reserved + p_quantity,
    format('Reserved %s units for order', p_quantity),
    p_user_id
  );
  
  -- Check if low stock alert needed
  IF (v_current_stock - (v_current_reserved + p_quantity)) <= (
    SELECT min_stock_threshold FROM products WHERE id = p_product_id
  ) THEN
    PERFORM create_inventory_alert(
      p_product_id,
      'low_stock',
      'high',
      format('Product "%s" is running low on stock', v_product_name)
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Stock reserved successfully',
    'reserved_quantity', p_quantity,
    'available_stock', v_current_stock - (v_current_reserved + p_quantity)
  );
END;
$$;

-- Function to release reserved stock (on cancellation)
CREATE OR REPLACE FUNCTION release_stock(
  p_product_id uuid,
  p_quantity integer,
  p_order_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock integer;
  v_current_reserved integer;
BEGIN
  -- Get current stock levels
  SELECT stock, reserved_stock 
  INTO v_current_stock, v_current_reserved
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Product not found'
    );
  END IF;
  
  -- Check if enough reserved stock
  IF v_current_reserved < p_quantity THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', format('Cannot release more than reserved. Reserved: %s, Requested: %s', v_current_reserved, p_quantity)
    );
  END IF;
  
  -- Release the stock
  UPDATE products
  SET reserved_stock = reserved_stock - p_quantity
  WHERE id = p_product_id;
  
  -- Log the movement
  INSERT INTO stock_movements (
    product_id,
    movement_type,
    quantity,
    order_id,
    previous_stock,
    new_stock,
    previous_reserved,
    new_reserved,
    notes,
    created_by
  ) VALUES (
    p_product_id,
    'release',
    p_quantity,
    p_order_id,
    v_current_stock,
    v_current_stock,
    v_current_reserved,
    v_current_reserved - p_quantity,
    COALESCE(p_notes, format('Released %s units from cancelled order', p_quantity)),
    p_user_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Stock released successfully',
    'released_quantity', p_quantity,
    'available_stock', v_current_stock - (v_current_reserved - p_quantity)
  );
END;
$$;

-- Function to finalize stock (on delivery)
CREATE OR REPLACE FUNCTION finalize_stock(
  p_product_id uuid,
  p_quantity integer,
  p_order_id uuid,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock integer;
  v_current_reserved integer;
BEGIN
  -- Get current stock levels
  SELECT stock, reserved_stock 
  INTO v_current_stock, v_current_reserved
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Product not found'
    );
  END IF;
  
  -- Check if enough stock and reserved stock
  IF v_current_stock < p_quantity OR v_current_reserved < p_quantity THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient stock or reserved stock'
    );
  END IF;
  
  -- Finalize: reduce both stock and reserved
  UPDATE products
  SET 
    stock = stock - p_quantity,
    reserved_stock = reserved_stock - p_quantity
  WHERE id = p_product_id;
  
  -- Log the movement
  INSERT INTO stock_movements (
    product_id,
    movement_type,
    quantity,
    order_id,
    previous_stock,
    new_stock,
    previous_reserved,
    new_reserved,
    notes,
    created_by
  ) VALUES (
    p_product_id,
    'finalize',
    p_quantity,
    p_order_id,
    v_current_stock,
    v_current_stock - p_quantity,
    v_current_reserved,
    v_current_reserved - p_quantity,
    format('Finalized %s units for delivered order', p_quantity),
    p_user_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Stock finalized successfully',
    'finalized_quantity', p_quantity,
    'remaining_stock', v_current_stock - p_quantity,
    'available_stock', (v_current_stock - p_quantity) - (v_current_reserved - p_quantity)
  );
END;
$$;

-- ============================================================================
-- 6. ALERT CHECK FUNCTIONS
-- ============================================================================

-- Function to check and return low stock products
CREATE OR REPLACE FUNCTION check_low_stock_products()
RETURNS TABLE (
  product_id uuid,
  product_name text,
  current_stock integer,
  reserved_stock integer,
  available_stock integer,
  min_threshold integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.stock,
    p.reserved_stock,
    (p.stock - p.reserved_stock) as available,
    p.min_stock_threshold
  FROM products p
  WHERE (p.stock - p.reserved_stock) <= p.min_stock_threshold
    AND p.stock > 0
  ORDER BY (p.stock - p.reserved_stock) ASC;
END;
$$;

-- Function to check expiring products
CREATE OR REPLACE FUNCTION check_expiring_products(p_days integer DEFAULT 30)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  expiry_date date,
  days_until_expiry integer,
  current_stock integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.expiry_date,
    (p.expiry_date - CURRENT_DATE)::integer as days_left,
    p.stock
  FROM products p
  WHERE p.expiry_date IS NOT NULL
    AND p.expiry_date >= CURRENT_DATE
    AND (p.expiry_date - CURRENT_DATE) <= p_days
    AND p.stock > 0
  ORDER BY p.expiry_date ASC;
END;
$$;

-- Function to check expired products
CREATE OR REPLACE FUNCTION check_expired_products()
RETURNS TABLE (
  product_id uuid,
  product_name text,
  expiry_date date,
  days_expired integer,
  current_stock integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.expiry_date,
    (CURRENT_DATE - p.expiry_date)::integer as days_past,
    p.stock
  FROM products p
  WHERE p.expiry_date IS NOT NULL
    AND p.expiry_date < CURRENT_DATE
    AND p.stock > 0
  ORDER BY p.expiry_date ASC;
END;
$$;

-- Function to resolve an alert
CREATE OR REPLACE FUNCTION resolve_inventory_alert(
  p_alert_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(p_user_id) THEN
    RAISE EXCEPTION 'Only admins can resolve alerts';
  END IF;
  
  UPDATE inventory_alerts
  SET 
    is_resolved = true,
    resolved_at = NOW(),
    resolved_by = p_user_id
  WHERE id = p_alert_id
    AND is_resolved = false;
  
  RETURN FOUND;
END;
$$;

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Trigger function to check stock alerts after stock changes
CREATE OR REPLACE FUNCTION trigger_check_stock_alerts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_available integer;
  v_product_name text;
BEGIN
  -- Calculate available stock
  v_available := NEW.stock - NEW.reserved_stock;
  
  -- Get product name
  SELECT name INTO v_product_name FROM products WHERE id = NEW.id;
  
  -- Check for out of stock
  IF v_available = 0 AND NEW.stock > 0 THEN
    PERFORM create_inventory_alert(
      NEW.id,
      'out_of_stock',
      'critical',
      format('Product "%s" is out of stock (all stock reserved)', v_product_name)
    );
  -- Check for low stock
  ELSIF v_available <= NEW.min_stock_threshold AND v_available > 0 THEN
    PERFORM create_inventory_alert(
      NEW.id,
      'low_stock',
      CASE 
        WHEN v_available <= NEW.min_stock_threshold / 2 THEN 'high'
        ELSE 'medium'
      END,
      format('Product "%s" is running low on stock. Available: %s', v_product_name, v_available)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for stock alerts
DROP TRIGGER IF EXISTS check_stock_alerts_trigger ON products;
CREATE TRIGGER check_stock_alerts_trigger
  AFTER UPDATE OF stock, reserved_stock ON products
  FOR EACH ROW
  WHEN (OLD.stock IS DISTINCT FROM NEW.stock OR OLD.reserved_stock IS DISTINCT FROM NEW.reserved_stock)
  EXECUTE FUNCTION trigger_check_stock_alerts();

-- Trigger function to check expiry alerts
CREATE OR REPLACE FUNCTION trigger_check_expiry_alerts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_days_until_expiry integer;
  v_product_name text;
BEGIN
  IF NEW.expiry_date IS NULL THEN
    RETURN NEW;
  END IF;
  
  v_days_until_expiry := NEW.expiry_date - CURRENT_DATE;
  SELECT name INTO v_product_name FROM products WHERE id = NEW.id;
  
  -- Check if expired
  IF v_days_until_expiry < 0 THEN
    PERFORM create_inventory_alert(
      NEW.id,
      'expired',
      'critical',
      format('Product "%s" has expired on %s', v_product_name, NEW.expiry_date)
    );
  -- Check if expiring soon
  ELSIF v_days_until_expiry <= NEW.expiry_alert_days THEN
    PERFORM create_inventory_alert(
      NEW.id,
      'expiring',
      CASE 
        WHEN v_days_until_expiry <= 7 THEN 'high'
        WHEN v_days_until_expiry <= 14 THEN 'medium'
        ELSE 'low'
      END,
      format('Product "%s" will expire in %s days', v_product_name, v_days_until_expiry)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for expiry alerts
DROP TRIGGER IF EXISTS check_expiry_alerts_trigger ON products;
CREATE TRIGGER check_expiry_alerts_trigger
  AFTER INSERT OR UPDATE OF expiry_date ON products
  FOR EACH ROW
  WHEN (NEW.expiry_date IS NOT NULL)
  EXECUTE FUNCTION trigger_check_expiry_alerts();

-- ============================================================================
-- 8. UPDATE EXISTING DATA
-- ============================================================================

-- Set default values for existing products
UPDATE products
SET 
  min_stock_threshold = 10,
  reserved_stock = 0,
  expiry_alert_days = 30
WHERE min_stock_threshold IS NULL 
   OR reserved_stock IS NULL 
   OR expiry_alert_days IS NULL;

-- ============================================================================
-- 9. GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_available_stock(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_low_stock_products() TO authenticated;
GRANT EXECUTE ON FUNCTION check_expiring_products(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION check_expired_products() TO authenticated;
GRANT EXECUTE ON FUNCTION reserve_stock(uuid, integer, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION release_stock(uuid, integer, uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION finalize_stock(uuid, integer, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION create_inventory_alert(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_inventory_alert(uuid, uuid) TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
