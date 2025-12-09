/*
# Integrate Stock Reservation with Order Management

## Overview
Enhance order creation and status change functions to automatically handle stock reservation,
release, and finalization based on order lifecycle.

## Changes
1. Update `create_order` function to reserve stock when order is created
2. Create trigger to handle stock updates on order status changes
3. Ensure stock is properly managed throughout order lifecycle

## Stock Management Flow
- Order Created (pending/processing): Reserve stock
- Order Cancelled: Release reserved stock
- Order Delivered: Finalize stock (reduce both stock and reserved)
- Order Refunded: Restore stock

## Security
- All stock operations use existing secure functions
- Maintains data integrity with transactions
- Prevents overselling through stock validation
*/

-- ============================================================================
-- 1. UPDATE CREATE_ORDER FUNCTION TO RESERVE STOCK
-- ============================================================================

CREATE OR REPLACE FUNCTION create_order(
  p_user_id uuid,
  p_items jsonb,
  p_total_amount numeric,
  p_gst_rate numeric,
  p_gst_amount numeric,
  p_shipping_cost numeric,
  p_points_used integer,
  p_currency text,
  p_status text,
  p_order_type text,
  p_payment_method text,
  p_payment_details jsonb,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_completed_at timestamptz
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  items jsonb,
  total_amount numeric,
  gst_rate numeric,
  gst_amount numeric,
  shipping_cost numeric,
  points_used integer,
  currency text,
  status text,
  order_type text,
  payment_method text,
  payment_details jsonb,
  customer_name text,
  customer_email text,
  customer_phone text,
  completed_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_reservation_result jsonb;
BEGIN
  -- Insert the order
  INSERT INTO orders (
    user_id,
    items,
    total_amount,
    gst_rate,
    gst_amount,
    shipping_cost,
    points_used,
    currency,
    status,
    order_type,
    payment_method,
    payment_details,
    customer_name,
    customer_email,
    customer_phone,
    completed_at
  ) VALUES (
    p_user_id,
    p_items,
    p_total_amount,
    p_gst_rate,
    p_gst_amount,
    p_shipping_cost,
    p_points_used,
    p_currency,
    p_status::order_status,
    p_order_type::order_type,
    p_payment_method::payment_method,
    p_payment_details,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_completed_at
  )
  RETURNING orders.id INTO v_order_id;

  -- Reserve stock for each item in the order
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Extract product_id and quantity from item
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    
    -- Skip if product_id is null
    IF v_product_id IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Reserve stock
    SELECT reserve_stock(
      v_product_id,
      v_quantity,
      v_order_id,
      p_user_id
    ) INTO v_reservation_result;
    
    -- Check if reservation was successful
    IF NOT (v_reservation_result->>'success')::boolean THEN
      -- Rollback the order creation
      RAISE EXCEPTION 'Failed to reserve stock for product %: %', 
        v_product_id, 
        v_reservation_result->>'message';
    END IF;
  END LOOP;

  -- Return the created order
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.items,
    o.total_amount,
    o.gst_rate,
    o.gst_amount,
    o.shipping_cost,
    o.points_used,
    o.currency,
    o.status::text,
    o.order_type::text,
    o.payment_method::text,
    o.payment_details,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.completed_at,
    o.created_at
  FROM orders o
  WHERE o.id = v_order_id;
END;
$$;

-- ============================================================================
-- 2. CREATE FUNCTION TO HANDLE STOCK ON ORDER STATUS CHANGE
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_order_stock_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_result jsonb;
BEGIN
  -- Only process if status has changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Handle different status transitions
  CASE NEW.status
    -- When order is cancelled, release reserved stock
    WHEN 'cancelled' THEN
      FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
      LOOP
        v_product_id := (v_item->>'product_id')::uuid;
        v_quantity := (v_item->>'quantity')::integer;
        
        IF v_product_id IS NOT NULL THEN
          SELECT release_stock(
            v_product_id,
            v_quantity,
            NEW.id,
            NEW.user_id,
            'Order cancelled'
          ) INTO v_result;
        END IF;
      END LOOP;

    -- When order is delivered, finalize stock
    WHEN 'delivered' THEN
      FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
      LOOP
        v_product_id := (v_item->>'product_id')::uuid;
        v_quantity := (v_item->>'quantity')::integer;
        
        IF v_product_id IS NOT NULL THEN
          SELECT finalize_stock(
            v_product_id,
            v_quantity,
            NEW.id,
            NEW.user_id
          ) INTO v_result;
        END IF;
      END LOOP;

    -- When order is refunded, restore stock
    WHEN 'refunded' THEN
      FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
      LOOP
        v_product_id := (v_item->>'product_id')::uuid;
        v_quantity := (v_item->>'quantity')::integer;
        
        IF v_product_id IS NOT NULL THEN
          -- For refunds, we need to add stock back
          -- First release the reserved stock (if any)
          SELECT release_stock(
            v_product_id,
            v_quantity,
            NEW.id,
            NEW.user_id,
            'Order refunded - releasing reserved stock'
          ) INTO v_result;
          
          -- Then add stock back using adjustment
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
          )
          SELECT
            v_product_id,
            'adjustment',
            v_quantity,
            NEW.id,
            p.stock,
            p.stock + v_quantity,
            p.reserved_stock,
            p.reserved_stock,
            'Stock restored due to refund',
            NEW.user_id
          FROM products p
          WHERE p.id = v_product_id;
          
          -- Update product stock
          UPDATE products
          SET stock = stock + v_quantity
          WHERE id = v_product_id;
        END IF;
      END LOOP;

    ELSE
      -- No stock changes for other status transitions
      NULL;
  END CASE;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. CREATE TRIGGER FOR ORDER STATUS CHANGES
-- ============================================================================

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_handle_order_stock_on_status_change ON orders;

-- Create trigger
CREATE TRIGGER trigger_handle_order_stock_on_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_stock_on_status_change();

-- ============================================================================
-- 4. CREATE FUNCTION TO CHECK STOCK AVAILABILITY BEFORE ORDER
-- ============================================================================

CREATE OR REPLACE FUNCTION check_stock_availability(p_items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_available integer;
  v_product_name text;
  v_unavailable_items jsonb := '[]'::jsonb;
BEGIN
  -- Check each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    
    IF v_product_id IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Get available stock
    SELECT get_available_stock(v_product_id) INTO v_available;
    SELECT name INTO v_product_name FROM products WHERE id = v_product_id;
    
    -- Check if enough stock available
    IF v_available < v_quantity THEN
      v_unavailable_items := v_unavailable_items || jsonb_build_object(
        'product_id', v_product_id,
        'product_name', v_product_name,
        'requested', v_quantity,
        'available', v_available
      );
    END IF;
  END LOOP;
  
  -- Return result
  IF jsonb_array_length(v_unavailable_items) > 0 THEN
    RETURN jsonb_build_object(
      'available', false,
      'message', 'Some items are out of stock or have insufficient quantity',
      'unavailable_items', v_unavailable_items
    );
  ELSE
    RETURN jsonb_build_object(
      'available', true,
      'message', 'All items are available'
    );
  END IF;
END;
$$;

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION create_order(uuid, jsonb, numeric, numeric, numeric, numeric, integer, text, text, text, text, jsonb, text, text, text, timestamptz) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_stock_availability(jsonb) TO authenticated, anon;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
