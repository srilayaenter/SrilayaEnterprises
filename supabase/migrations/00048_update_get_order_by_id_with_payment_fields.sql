/*
# Update get_order_by_id RPC to include payment fields

## Plain English Explanation
This migration updates the get_order_by_id RPC function to return payment_method, 
payment_details, customer_city, and customer_state fields which are needed for 
displaying complete order information including payment details on bills.

## Changes
1. Add payment_method to return fields
2. Add payment_details to return fields  
3. Add customer_city to return fields
4. Add customer_state to return fields

## Notes
- These fields already exist in the orders table
- This just exposes them through the RPC function
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