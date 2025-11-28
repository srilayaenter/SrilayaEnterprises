/*
# Fix Order Status Sync Trigger

## Issue
The `update_order_status_from_shipment()` trigger function was trying to set invalid values for the `order_status` enum:
- Tried to set 'delivered' but order_status only has: pending, completed, cancelled, refunded
- Tried to set 'shipped' but order_status only has: pending, completed, cancelled, refunded

This caused the error: "invalid input value for enum order_status: 'delivered'"

## Solution
Update the trigger function to map shipment statuses to valid order statuses:
- shipment 'delivered' → order 'completed'
- shipment 'picked_up', 'in_transit', 'out_for_delivery' → order 'completed'
- shipment 'returned' → order 'cancelled'
- shipment 'cancelled' → order 'cancelled'

## Valid Enum Values
- order_status: pending, completed, cancelled, refunded
- shipment_status: pending, picked_up, in_transit, out_for_delivery, delivered, returned, cancelled
*/

-- Drop and recreate the trigger function with correct status mapping
CREATE OR REPLACE FUNCTION update_order_status_from_shipment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update order status based on shipment status
  -- Map shipment statuses to valid order_status enum values
  
  IF NEW.status = 'delivered' THEN
    -- When shipment is delivered, mark order as completed
    UPDATE orders SET status = 'completed' WHERE id = NEW.order_id;
    
  ELSIF NEW.status IN ('returned', 'cancelled') THEN
    -- When shipment is returned or cancelled, mark order as cancelled
    UPDATE orders SET status = 'cancelled' WHERE id = NEW.order_id;
    
  ELSIF NEW.status IN ('picked_up', 'in_transit', 'out_for_delivery') THEN
    -- When shipment is in progress, mark order as completed (payment already processed)
    -- The order was already 'completed' after payment, so this maintains that status
    UPDATE orders SET status = 'completed' WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- The trigger already exists, no need to recreate it
-- It will automatically use the updated function
