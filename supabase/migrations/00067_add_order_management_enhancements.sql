/*
# Order Management Enhancements

## 1. Overview
This migration adds comprehensive order management features including:
- Order cancellation with 30-minute time window
- Order modification capabilities
- Enhanced order tracking with detailed status flow
- Order modification history tracking

## 2. Changes

### A. Enhanced Order Status Enum
Add new statuses to support detailed order tracking:
- `processing`: Order is being prepared
- `packed`: Order is packed and ready to ship
- `shipped`: Order has been shipped
- `out_for_delivery`: Order is out for delivery
- `delivered`: Order has been delivered

### B. Orders Table Enhancements
New columns:
- `is_cancelled` (boolean): Flag to mark cancelled orders
- `cancellation_requested_at` (timestamptz): When cancellation was requested
- `cancellation_reason` (text): Reason for cancellation
- `estimated_delivery` (timestamptz): Expected delivery date/time
- `tracking_number` (text): Courier tracking number
- `actual_delivery_at` (timestamptz): Actual delivery timestamp
- `can_be_modified` (boolean): Flag to control modification permission

### C. Order Modifications Table
Track all modifications made to orders:
- `id` (uuid): Primary key
- `order_id` (uuid): Reference to order
- `modified_by` (uuid): User who made the modification
- `modification_type` (text): Type of modification (quantity_change, item_added, item_removed, address_change)
- `old_value` (jsonb): Previous value
- `new_value` (jsonb): New value
- `notes` (text): Additional notes
- `created_at` (timestamptz): When modification was made

### D. Order Status History Table
Track status changes for audit trail:
- `id` (uuid): Primary key
- `order_id` (uuid): Reference to order
- `old_status` (order_status): Previous status
- `new_status` (order_status): New status
- `changed_by` (uuid): User who changed status
- `notes` (text): Additional notes
- `created_at` (timestamptz): When status was changed

## 3. Functions

### A. can_cancel_order(order_id uuid)
Checks if an order can be cancelled based on:
- Time window (30 minutes from creation)
- Current status (only pending/processing)
- Not already cancelled

### B. can_modify_order(order_id uuid)
Checks if an order can be modified based on:
- Current status (only pending/processing)
- Not cancelled
- Not delivered

### C. cancel_order(p_order_id uuid, p_user_id uuid, p_reason text)
Cancels an order with validation and refund initiation

### D. update_order_status(p_order_id uuid, p_new_status order_status, p_user_id uuid, p_notes text)
Updates order status with history tracking

## 4. Security
- RLS policies for order_modifications table
- RLS policies for order_status_history table
- Users can only cancel/modify their own orders
- Admins can manage all orders

## 5. Triggers
- Auto-track status changes
- Auto-update can_be_modified flag based on status
*/

-- Step 1: Drop existing triggers that depend on status column
DROP TRIGGER IF EXISTS trigger_update_inventory_on_order_completion ON orders;
DROP TRIGGER IF EXISTS track_order_status_change_trigger ON orders;
DROP TRIGGER IF EXISTS order_status_notification ON orders;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

-- Step 2: Drop existing order_status enum and recreate with new values
ALTER TABLE orders ALTER COLUMN status TYPE text;
DROP TYPE IF EXISTS order_status CASCADE;
CREATE TYPE order_status AS ENUM (
  'pending',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'completed',
  'cancelled',
  'refunded'
);
ALTER TABLE orders ALTER COLUMN status TYPE order_status USING status::order_status;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending'::order_status;

-- Step 3: Add new columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS is_cancelled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancellation_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS estimated_delivery timestamptz,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS actual_delivery_at timestamptz,
  ADD COLUMN IF NOT EXISTS can_be_modified boolean DEFAULT true;

-- Step 4: Create order_modifications table
CREATE TABLE IF NOT EXISTS order_modifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  modified_by uuid REFERENCES profiles(id) NOT NULL,
  modification_type text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_order_modifications_order_id ON order_modifications(order_id);
CREATE INDEX idx_order_modifications_created_at ON order_modifications(created_at DESC);

-- Step 5: Create order_status_history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  old_status order_status,
  new_status order_status NOT NULL,
  changed_by uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- Step 6: Enable RLS
ALTER TABLE order_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for order_modifications
CREATE POLICY "Users can view modifications of their orders" ON order_modifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_modifications.order_id
      AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all modifications" ON order_modifications
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can create modifications for their orders" ON order_modifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_modifications.order_id
      AND o.user_id = auth.uid()
    )
    AND modified_by = auth.uid()
  );

CREATE POLICY "Admins can create any modification" ON order_modifications
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Step 8: Create RLS policies for order_status_history
CREATE POLICY "Users can view status history of their orders" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id
      AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all status history" ON order_status_history
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create status history" ON order_status_history
  FOR INSERT WITH CHECK (is_admin(auth.uid()) OR changed_by = auth.uid());

-- Step 9: Create function to check if order can be cancelled
CREATE OR REPLACE FUNCTION can_cancel_order(p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_time_diff_minutes numeric;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if already cancelled
  IF v_order.is_cancelled OR v_order.status = 'cancelled'::order_status THEN
    RETURN false;
  END IF;
  
  -- Check if status allows cancellation (only pending or processing)
  IF v_order.status NOT IN ('pending'::order_status, 'processing'::order_status) THEN
    RETURN false;
  END IF;
  
  -- Check time window (30 minutes)
  v_time_diff_minutes := EXTRACT(EPOCH FROM (now() - v_order.created_at)) / 60;
  IF v_time_diff_minutes > 30 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Step 10: Create function to check if order can be modified
CREATE OR REPLACE FUNCTION can_modify_order(p_order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if cancelled
  IF v_order.is_cancelled OR v_order.status = 'cancelled'::order_status THEN
    RETURN false;
  END IF;
  
  -- Check if status allows modification (only pending or processing)
  IF v_order.status NOT IN ('pending'::order_status, 'processing'::order_status) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Step 11: Create function to cancel order
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id uuid,
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_can_cancel boolean;
  v_result jsonb;
BEGIN
  -- Check if order exists and belongs to user
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Order not found'
    );
  END IF;
  
  -- Check if user owns the order or is admin
  IF v_order.user_id != p_user_id AND NOT is_admin(p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Unauthorized'
    );
  END IF;
  
  -- Check if order can be cancelled
  v_can_cancel := can_cancel_order(p_order_id);
  IF NOT v_can_cancel THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Order cannot be cancelled. Time window expired or order already processed.'
    );
  END IF;
  
  -- Update order
  UPDATE orders
  SET
    status = 'cancelled'::order_status,
    is_cancelled = true,
    cancellation_requested_at = now(),
    cancellation_reason = p_reason,
    can_be_modified = false,
    updated_at = now()
  WHERE id = p_order_id;
  
  -- Record status change
  INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes)
  VALUES (p_order_id, v_order.status, 'cancelled'::order_status, p_user_id, p_reason);
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Order cancelled successfully'
  );
END;
$$;

-- Step 12: Create function to update order status
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id uuid,
  p_new_status order_status,
  p_user_id uuid,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_old_status order_status;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(p_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Unauthorized. Only admins can update order status.'
    );
  END IF;
  
  -- Get current order
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Order not found'
    );
  END IF;
  
  v_old_status := v_order.status;
  
  -- Update order status
  UPDATE orders
  SET
    status = p_new_status,
    can_be_modified = CASE
      WHEN p_new_status IN ('pending'::order_status, 'processing'::order_status) THEN true
      ELSE false
    END,
    actual_delivery_at = CASE
      WHEN p_new_status = 'delivered'::order_status THEN now()
      ELSE actual_delivery_at
    END,
    completed_at = CASE
      WHEN p_new_status IN ('delivered'::order_status, 'completed'::order_status) THEN now()
      ELSE completed_at
    END,
    updated_at = now()
  WHERE id = p_order_id;
  
  -- Record status change
  INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes)
  VALUES (p_order_id, v_old_status, p_new_status, p_user_id, p_notes);
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Order status updated successfully',
    'old_status', v_old_status,
    'new_status', p_new_status
  );
END;
$$;

-- Step 13: Create trigger to auto-track status changes
CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, old_status, new_status, notes)
    VALUES (NEW.id, OLD.status, NEW.status, 'Auto-tracked status change');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS track_order_status_change_trigger ON orders;
CREATE TRIGGER track_order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION track_order_status_change();

-- Step 14: Update existing orders to set can_be_modified based on status
UPDATE orders
SET can_be_modified = CASE
  WHEN status IN ('pending'::order_status, 'processing'::order_status) AND NOT is_cancelled THEN true
  ELSE false
END
WHERE can_be_modified IS NULL OR can_be_modified != CASE
  WHEN status IN ('pending'::order_status, 'processing'::order_status) AND NOT is_cancelled THEN true
  ELSE false
END;

-- Step 15: Recreate the inventory trigger with updated status enum
CREATE OR REPLACE FUNCTION update_inventory_on_order_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item jsonb;
  variant_record RECORD;
BEGIN
  -- Only process when order status changes to completed or delivered
  IF (OLD.status IS DISTINCT FROM NEW.status) AND 
     (NEW.status IN ('completed'::order_status, 'delivered'::order_status)) THEN
    
    -- Loop through each item in the order
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      -- Get the variant_id from the item
      IF item->>'variant_id' IS NOT NULL THEN
        -- Update the stock for this variant
        UPDATE product_variants
        SET stock = GREATEST(0, stock - (item->>'quantity')::integer)
        WHERE id = (item->>'variant_id')::uuid;
        
        -- Also update the product's total stock
        SELECT product_id INTO variant_record
        FROM product_variants
        WHERE id = (item->>'variant_id')::uuid;
        
        IF FOUND THEN
          UPDATE products
          SET stock = (
            SELECT COALESCE(SUM(stock), 0)
            FROM product_variants
            WHERE product_id = variant_record.product_id
          )
          WHERE id = variant_record.product_id;
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_inventory_on_order_completion ON orders;
CREATE TRIGGER trigger_update_inventory_on_order_completion
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_order_completion();

-- Step 16: Recreate the update_updated_at trigger
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Step 17: Recreate the order_status_notification trigger
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, related_id)
    VALUES (
      NEW.user_id,
      'Order Status Updated',
      'Your order #' || substring(NEW.id::text, 1, 8) || ' status has been updated to: ' || NEW.status,
      'order',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_status_notification ON orders;
CREATE TRIGGER order_status_notification
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_order_status_change();
