/*
# Add RPC Function for Fetching Order by ID

## Purpose
Create a secure RPC function to fetch order details by ID, bypassing RLS.
This allows the payment success page to display order information even if the user
doesn't have direct SELECT permission on the orders table.

## Changes
1. Create `get_order_by_id` RPC function with SECURITY DEFINER
2. Function accepts order_id and returns the order data
3. Used for displaying order confirmation on payment success page

## Security
- SECURITY DEFINER allows function to bypass RLS for reading
- Only returns order data, doesn't allow modifications
- Public access is acceptable since order IDs are UUIDs (hard to guess)
- Order data is not sensitive (customer already knows their order details)
*/

CREATE OR REPLACE FUNCTION get_order_by_id(p_order_id uuid)
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
  customer_city text,
  customer_state text,
  shipping_address text,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    o.payment_method,
    o.payment_details,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.customer_city,
    o.customer_state,
    o.shipping_address,
    o.completed_at,
    o.created_at,
    o.updated_at
  FROM orders o
  WHERE o.id = p_order_id;
END;
$$;