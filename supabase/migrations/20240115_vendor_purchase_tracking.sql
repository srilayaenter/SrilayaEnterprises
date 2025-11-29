/*
# Vendor Integration & Purchase Order Tracking System

## Plain English Explanation
This migration adds comprehensive vendor and purchase order tracking capabilities to the system.
It allows products to be linked to vendors, tracks purchase orders with delivery and payment status,
and maintains a complete payment history for vendor transactions.

## 1. Schema Changes

### products table modification
- Add `vendor_id` (uuid, references vendors table)
  - Links each product to its supplier/vendor
  - Nullable to support existing products without vendors

### purchase_orders table
- `id` (uuid, primary key)
- `vendor_id` (uuid, references vendors, required)
- `order_number` (text, unique, auto-generated like PO-001)
- `order_date` (date, default today)
- `expected_delivery_date` (date, nullable)
- `actual_delivery_date` (date, nullable)
- `total_amount` (numeric, calculated from items)
- `payment_status` (enum: pending, partial, paid)
- `delivery_status` (enum: pending, in_transit, delivered, cancelled)
- `notes` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### purchase_order_items table
- `id` (uuid, primary key)
- `purchase_order_id` (uuid, references purchase_orders)
- `product_id` (uuid, references products)
- `variant_id` (uuid, references product_variants, nullable)
- `quantity` (integer, required)
- `unit_price` (numeric, required)
- `total_price` (numeric, calculated: quantity * unit_price)
- `created_at` (timestamptz)

### vendor_payments table
- `id` (uuid, primary key)
- `vendor_id` (uuid, references vendors, required)
- `purchase_order_id` (uuid, references purchase_orders, nullable)
- `payment_date` (date, default today)
- `amount` (numeric, required)
- `payment_method` (text: cash, bank_transfer, cheque, upi, etc.)
- `reference_number` (text, nullable - cheque/transaction number)
- `notes` (text, nullable)
- `created_at` (timestamptz)

## 2. Security
- All tables are public (no RLS) as per project requirements
- Admin panel controls all access

## 3. Indexes
- Index on products.vendor_id for fast vendor product lookups
- Index on purchase_orders.vendor_id for vendor transaction queries
- Index on purchase_orders.order_date for date-based filtering
- Index on vendor_payments.vendor_id for payment history queries
- Index on vendor_payments.purchase_order_id for PO payment lookups

## 4. Functions
- `generate_po_number()` - Auto-generates sequential PO numbers (PO-001, PO-002, etc.)
- `update_po_total()` - Trigger to recalculate PO total when items change
- `update_po_payment_status()` - Trigger to update payment status based on payments
*/

-- Create ENUM type for delivery status (payment_status already exists)
CREATE TYPE delivery_status AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled');

-- Add vendor_id to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  order_number text UNIQUE NOT NULL,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date date,
  actual_delivery_date date,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  delivery_status delivery_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_date ON purchase_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_delivery_status ON purchase_orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_payment_status ON purchase_orders(payment_status);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON purchase_order_items(product_id);

-- Create vendor_payments table
CREATE TABLE IF NOT EXISTS vendor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  purchase_order_id uuid REFERENCES purchase_orders(id) ON DELETE SET NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL,
  reference_number text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor_id ON vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_po_id ON vendor_payments(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_payment_date ON vendor_payments(payment_date DESC);

-- Function to generate sequential PO numbers
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  po_number text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 4) AS integer)), 0) + 1
  INTO next_num
  FROM purchase_orders
  WHERE order_number ~ '^PO-[0-9]+$';
  
  po_number := 'PO-' || LPAD(next_num::text, 3, '0');
  RETURN po_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate PO number
CREATE OR REPLACE FUNCTION set_po_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_po_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_po_number ON purchase_orders;
CREATE TRIGGER trigger_set_po_number
  BEFORE INSERT ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_po_number();

-- Function to update PO total when items change
CREATE OR REPLACE FUNCTION update_po_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE purchase_orders
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM purchase_order_items
    WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_po_total_insert ON purchase_order_items;
CREATE TRIGGER trigger_update_po_total_insert
  AFTER INSERT ON purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_po_total();

DROP TRIGGER IF EXISTS trigger_update_po_total_update ON purchase_order_items;
CREATE TRIGGER trigger_update_po_total_update
  AFTER UPDATE ON purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_po_total();

DROP TRIGGER IF EXISTS trigger_update_po_total_delete ON purchase_order_items;
CREATE TRIGGER trigger_update_po_total_delete
  AFTER DELETE ON purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_po_total();

-- Function to update PO payment status based on payments
CREATE OR REPLACE FUNCTION update_po_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  po_total numeric;
  total_paid numeric;
BEGIN
  -- Get the PO total and total paid
  SELECT po.total_amount INTO po_total
  FROM purchase_orders po
  WHERE po.id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);
  
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM vendor_payments
  WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);
  
  -- Update payment status
  UPDATE purchase_orders
  SET payment_status = CASE
    WHEN total_paid = 0 THEN 'pending'::payment_status
    WHEN total_paid >= po_total THEN 'paid'::payment_status
    ELSE 'partial'::payment_status
  END,
  updated_at = now()
  WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_po_payment_status_insert ON vendor_payments;
CREATE TRIGGER trigger_update_po_payment_status_insert
  AFTER INSERT ON vendor_payments
  FOR EACH ROW
  WHEN (NEW.purchase_order_id IS NOT NULL)
  EXECUTE FUNCTION update_po_payment_status();

DROP TRIGGER IF EXISTS trigger_update_po_payment_status_update ON vendor_payments;
CREATE TRIGGER trigger_update_po_payment_status_update
  AFTER UPDATE ON vendor_payments
  FOR EACH ROW
  WHEN (NEW.purchase_order_id IS NOT NULL OR OLD.purchase_order_id IS NOT NULL)
  EXECUTE FUNCTION update_po_payment_status();

DROP TRIGGER IF EXISTS trigger_update_po_payment_status_delete ON vendor_payments;
CREATE TRIGGER trigger_update_po_payment_status_delete
  AFTER DELETE ON vendor_payments
  FOR EACH ROW
  WHEN (OLD.purchase_order_id IS NOT NULL)
  EXECUTE FUNCTION update_po_payment_status();

-- Function to update inventory when PO is delivered
CREATE OR REPLACE FUNCTION update_inventory_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update inventory when delivery_status changes to 'delivered'
  IF NEW.delivery_status = 'delivered' AND (OLD.delivery_status IS NULL OR OLD.delivery_status != 'delivered') THEN
    -- Update stock for all items in this PO
    UPDATE product_variants pv
    SET stock = pv.stock + poi.quantity
    FROM purchase_order_items poi
    WHERE poi.purchase_order_id = NEW.id
      AND poi.variant_id = pv.id;
    
    -- Set actual delivery date if not set
    IF NEW.actual_delivery_date IS NULL THEN
      NEW.actual_delivery_date := CURRENT_DATE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory_on_delivery ON purchase_orders;
CREATE TRIGGER trigger_update_inventory_on_delivery
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_delivery();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER trigger_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
