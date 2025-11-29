/*
# Add Purchase Order Inventory Update Trigger

## Purpose
Automatically update product_variants stock when a purchase order is received.

## Changes
1. Create function to update inventory stock when PO is received
2. Create trigger on purchase_orders table to call the function when status changes to 'received'

## Logic
- When purchase order status changes to 'received'
- Parse purchase order items from JSONB
- For each item, increment the stock in product_variants table
- Use variant_id to identify which variant to update
- Increment stock by the quantity received

## Notes
- Function runs automatically when PO is marked as received
- Adds stock to existing inventory
- Only processes when status changes to 'received' (not on other status changes)
*/

-- Create function to update inventory when purchase order is received
CREATE OR REPLACE FUNCTION update_inventory_on_purchase_order_received()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  variant_id_val uuid;
  quantity_val integer;
BEGIN
  -- Only process if status changed to 'received'
  IF NEW.status = 'received' AND (OLD.status IS NULL OR OLD.status != 'received') THEN
    -- Loop through each item in the purchase order
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      -- Extract variant_id and quantity from the item
      variant_id_val := (item->>'variant_id')::uuid;
      quantity_val := (item->>'quantity')::integer;
      
      -- Update the stock for this variant (increment)
      UPDATE product_variants
      SET stock = stock + quantity_val
      WHERE id = variant_id_val;
      
      -- Log if variant not found (for debugging)
      IF NOT FOUND THEN
        RAISE WARNING 'Variant % not found for purchase order %', variant_id_val, NEW.id;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function after purchase order update
CREATE TRIGGER trigger_update_inventory_on_purchase_order_received
AFTER UPDATE ON purchase_orders
FOR EACH ROW
WHEN (NEW.status = 'received')
EXECUTE FUNCTION update_inventory_on_purchase_order_received();

-- Add comment for documentation
COMMENT ON FUNCTION update_inventory_on_purchase_order_received() IS 
'Automatically increments product_variants stock when a purchase order status changes to received';

COMMENT ON TRIGGER trigger_update_inventory_on_purchase_order_received ON purchase_orders IS 
'Triggers inventory update when purchase order is received';
