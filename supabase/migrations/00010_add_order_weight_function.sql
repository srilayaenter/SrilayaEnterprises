/*
# Add Order Weight Calculation Function

## Plain English Explanation
This migration adds a function to calculate total weight from order items.

## Changes Made
1. Create get_order_weight() function to calculate total weight from order items JSONB

## Usage
- Used to calculate shipping costs for orders
- Sums up (quantity × weight) for all items in order

## Notes
- Returns weight in kilograms
- Handles missing variant_id gracefully
*/

-- Function to calculate total weight from order items
CREATE OR REPLACE FUNCTION get_order_weight(order_items jsonb)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_weight numeric := 0;
  item jsonb;
  variant_weight numeric;
  item_quantity integer;
BEGIN
  -- Loop through each item in the order
  FOR item IN SELECT * FROM jsonb_array_elements(order_items)
  LOOP
    -- Get variant weight (default to 1.0 if not found)
    SELECT COALESCE(weight_kg, 1.0) INTO variant_weight
    FROM product_variants
    WHERE id = (item->>'variant_id')::uuid;
    
    -- If variant not found, use default weight
    IF variant_weight IS NULL THEN
      variant_weight := 1.0;
    END IF;
    
    -- Get item quantity
    item_quantity := COALESCE((item->>'quantity')::integer, 1);
    
    -- Add to total weight
    total_weight := total_weight + (variant_weight * item_quantity);
  END LOOP;
  
  RETURN ROUND(total_weight, 3);
END;
$$;

COMMENT ON FUNCTION get_order_weight IS 'Calculate total weight in kg from order items JSONB array';