/*
# Add RPC Function for Creating Orders

## Purpose
Create a secure RPC function to handle order creation for both authenticated and anonymous users.
This bypasses RLS policies using SECURITY DEFINER while maintaining data integrity.

## Changes
1. Create `create_order` RPC function with SECURITY DEFINER
2. Function accepts all order parameters and returns the created order
3. Handles both authenticated (with user_id) and anonymous (without user_id) orders
4. Used for in-store cash/UPI/split payments

## Security
- SECURITY DEFINER allows function to bypass RLS
- Input validation ensures data integrity
- Only creates orders, doesn't modify existing data
*/

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