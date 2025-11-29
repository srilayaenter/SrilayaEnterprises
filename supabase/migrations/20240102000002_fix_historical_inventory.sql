/*
# Fix Historical Inventory Data

## Purpose
Retroactively update product_variants stock for all completed orders that were processed before the inventory trigger was added.

## Changes
1. Create a one-time function to process all completed orders
2. Decrement stock for each order item
3. Ensure stock doesn't go negative

## Logic
- Find all completed orders
- For each order, loop through items
- Decrement stock by quantity ordered
- Use GREATEST to prevent negative stock

## Notes
- This is a one-time fix for historical data
- Future orders will be handled automatically by the trigger
- Function will be dropped after execution
*/

-- Create temporary function to fix historical inventory
CREATE OR REPLACE FUNCTION fix_historical_inventory()
RETURNS TABLE(
  order_id uuid,
  variant_id uuid,
  product_name text,
  packaging_size text,
  quantity_ordered integer,
  old_stock integer,
  new_stock integer
) AS $$
DECLARE
  order_record RECORD;
  item JSONB;
  variant_id_val uuid;
  quantity_val integer;
  old_stock_val integer;
  new_stock_val integer;
  product_name_val text;
  packaging_size_val text;
BEGIN
  -- Loop through all completed orders
  FOR order_record IN 
    SELECT id, items, completed_at
    FROM orders
    WHERE status = 'completed'
    ORDER BY completed_at ASC
  LOOP
    -- Loop through each item in the order
    FOR item IN SELECT * FROM jsonb_array_elements(order_record.items)
    LOOP
      -- Extract variant_id and quantity
      variant_id_val := (item->>'variant_id')::uuid;
      quantity_val := (item->>'quantity')::integer;
      
      -- Get current stock and product info
      SELECT pv.stock, p.name, pv.packaging_size
      INTO old_stock_val, product_name_val, packaging_size_val
      FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      WHERE pv.id = variant_id_val;
      
      IF FOUND THEN
        -- Calculate new stock (prevent negative)
        new_stock_val := GREATEST(old_stock_val - quantity_val, 0);
        
        -- Update the stock
        UPDATE product_variants
        SET stock = new_stock_val
        WHERE id = variant_id_val;
        
        -- Return the change for logging
        RETURN QUERY SELECT 
          order_record.id,
          variant_id_val,
          product_name_val,
          packaging_size_val,
          quantity_val,
          old_stock_val,
          new_stock_val;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to fix historical data
-- Note: Comment this out after first run to prevent re-execution
SELECT * FROM fix_historical_inventory();

-- Drop the temporary function
DROP FUNCTION IF EXISTS fix_historical_inventory();

-- Add comment for documentation
COMMENT ON FUNCTION update_inventory_on_order_completion() IS 
'Automatically decrements product_variants stock when an order status changes to completed. Historical data was fixed on 2025-11-26.';
