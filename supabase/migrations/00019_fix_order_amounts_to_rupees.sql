/*
# Fix Order Amounts - Convert from Paise to Rupees

This migration fixes existing orders that have amounts stored in paise (smallest currency unit)
and converts them to rupees for consistency.

## Changes:
1. Convert item prices in the items JSONB from paise to rupees (divide by 100)
2. Convert total_amount from paise to rupees (divide by 100)
3. Convert gst_amount from paise to rupees (divide by 100)
4. shipping_cost is already in rupees, so no change needed

## Affected Fields:
- orders.items (JSONB) - price field within each item
- orders.total_amount - subtotal before GST and shipping
- orders.gst_amount - GST amount

## Note:
This is a one-time data migration to fix the currency unit inconsistency.
After this migration, all amounts will be stored in rupees.
*/

-- Update items JSONB to convert prices from paise to rupees
UPDATE orders
SET items = (
  SELECT jsonb_agg(
    jsonb_set(
      item,
      '{price}',
      to_jsonb(ROUND((item->>'price')::numeric / 100, 2))
    )
  )
  FROM jsonb_array_elements(items) AS item
)
WHERE EXISTS (
  SELECT 1
  FROM jsonb_array_elements(items) AS item
  WHERE (item->>'price')::numeric > 1000
);

-- Convert total_amount from paise to rupees
UPDATE orders
SET total_amount = ROUND(total_amount / 100, 2)
WHERE total_amount > 1000;

-- Convert gst_amount from paise to rupees
UPDATE orders
SET gst_amount = ROUND(gst_amount / 100, 2)
WHERE gst_amount > 100;

-- Add comment to document the currency unit
COMMENT ON COLUMN orders.total_amount IS 'Subtotal amount in rupees (before GST and shipping)';
COMMENT ON COLUMN orders.gst_amount IS 'GST amount in rupees';
COMMENT ON COLUMN orders.shipping_cost IS 'Shipping cost in rupees';