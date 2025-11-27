/*
# Add Discount and Cost Price to Product Variants

## Changes
1. Add cost_price column to product_variants table
2. Add discount_percentage column to product_variants table
3. Update existing variants with discount percentages based on packaging size
4. Recalculate prices based on cost_price + 25% markup - discount

## Plain English Explanation
This migration adds discount functionality to products based on packaging size:
- 5kg packages: 2% discount
- 10kg packages: 3% discount
- Honey 500g: 2% discount
- Honey 1kg: 3% discount

Selling price is calculated as: (cost_price * 1.25) * (1 - discount_percentage/100)

## Notes
- cost_price: The base cost of the product
- discount_percentage: The discount applied based on packaging size
- price: The final selling price after markup and discount
*/

-- Add new columns to product_variants
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percentage numeric DEFAULT 0;

-- Update existing variants to set cost_price based on current price
-- Assuming current price already includes 25% markup, we reverse calculate: cost_price = price / 1.25
UPDATE product_variants 
SET cost_price = ROUND(price / 1.25, 2)
WHERE cost_price = 0 OR cost_price IS NULL;

-- Set discount percentages based on packaging size
-- For regular products (Millets, Rice, Flakes, Sugar, Laddus)
UPDATE product_variants 
SET discount_percentage = 2.0
WHERE packaging_size = '5kg' AND discount_percentage = 0;

UPDATE product_variants 
SET discount_percentage = 3.0
WHERE packaging_size = '10kg' AND discount_percentage = 0;

-- For honey products
UPDATE product_variants pv
SET discount_percentage = 2.0
FROM products p
WHERE pv.product_id = p.id 
  AND p.category = 'honey' 
  AND pv.packaging_size = '500g' 
  AND pv.discount_percentage = 0;

UPDATE product_variants pv
SET discount_percentage = 3.0
FROM products p
WHERE pv.product_id = p.id 
  AND p.category = 'honey' 
  AND pv.packaging_size = '1kg' 
  AND pv.discount_percentage = 0;

-- Recalculate prices with discount applied
-- Formula: price = (cost_price * 1.25) * (1 - discount_percentage/100)
UPDATE product_variants 
SET price = ROUND((cost_price * 1.25) * (1 - discount_percentage / 100), 2)
WHERE discount_percentage > 0;
