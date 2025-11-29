/*
# Add Inventory Update Trigger

## Purpose
Automatically update product_variants stock when an order is completed.

## Changes
1. Create function to update inventory stock
2. Create trigger on orders table to call the function when status changes to 'completed'

## Logic
- When order status changes from 'pending' to 'completed'
- Parse order items from JSONB
- For each item, decrement the stock in product_variants table
- Use variant_id to identify which variant to update
- Decrement stock by the quantity ordered

## Notes
- Function runs automatically on order completion
- Prevents negative stock (stock cannot go below 0)
- Logs errors if variant not found
*/

-- Create function to update inventory when order is completed
CREATE OR REPLACE FUNCTION update_inventory_on_order_completion()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  variant_id_val uuid;
  quantity_val integer;
BEGIN
  -- Only process if status changed to 'completed' from 'pending'
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    -- Loop through each item in the order
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      -- Extract variant_id and quantity from the item
      variant_id_val := (item->>'variant_id')::uuid;
      quantity_val := (item->>'quantity')::integer;
      
      -- Update the stock for this variant
      UPDATE product_variants
      SET stock = GREATEST(stock - quantity_val, 0)
      WHERE id = variant_id_val;
      
      -- Log if variant not found (for debugging)
      IF NOT FOUND THEN
        RAISE WARNING 'Variant % not found for order %', variant_id_val, NEW.id;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function after order update
CREATE TRIGGER trigger_update_inventory_on_order_completion
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status = 'pending')
EXECUTE FUNCTION update_inventory_on_order_completion();

-- Add comment for documentation
COMMENT ON FUNCTION update_inventory_on_order_completion() IS 
'Automatically decrements product_variants stock when an order status changes to completed';

COMMENT ON TRIGGER trigger_update_inventory_on_order_completion ON orders IS 
'Triggers inventory update when order is completed';
