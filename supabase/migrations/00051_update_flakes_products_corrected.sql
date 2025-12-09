/*
# Update Flakes Category Products

1. Changes
   - Remove: Sorghum Flakes (FLAKES007)
   - Add 8 new flakes products

2. Product Details
   - Standard packaging: 1kg, 2kg, 5kg, 10kg
   - Discount policy: 2% for 5kg, 3% for 10kg
*/

-- Step 1: Delete the old Sorghum Flakes product and its variants
DELETE FROM product_variants WHERE product_id IN (
  SELECT id FROM products WHERE product_code = 'FLAKES007' AND name = 'Sorghum Flakes'
);

DELETE FROM products WHERE product_code = 'FLAKES007' AND name = 'Sorghum Flakes';

-- Step 2: Insert new flakes products
INSERT INTO products (id, product_code, name, category, description, base_price)
VALUES
  (gen_random_uuid(), 'FLAKES007', 'Red Sorghum Flakes', 'flakes', 'Nutritious red sorghum flakes, rich in antioxidants', 92.00),
  (gen_random_uuid(), 'FLAKES008', 'White Sorghum Flakes', 'flakes', 'Light and crispy white sorghum flakes', 90.00),
  (gen_random_uuid(), 'FLAKES009', 'Green Gram Flakes', 'flakes', 'Protein-rich green gram flakes', 95.00),
  (gen_random_uuid(), 'FLAKES010', 'Horse Gram Flakes', 'flakes', 'High-protein horse gram flakes', 98.00),
  (gen_random_uuid(), 'FLAKES011', 'Wheat Flakes', 'flakes', 'Wholesome wheat flakes for healthy breakfast', 85.00),
  (gen_random_uuid(), 'FLAKES012', 'Barley Flakes', 'flakes', 'Fiber-rich barley flakes', 88.00),
  (gen_random_uuid(), 'FLAKES013', 'Karupukavini Rice Flakes', 'flakes', 'Traditional black rice flakes, nutrient-dense', 120.00),
  (gen_random_uuid(), 'FLAKES014', 'Mapillai Sambha Rice Flakes', 'flakes', 'Premium red rice flakes with medicinal properties', 125.00);

-- Step 3: Create variants for all new flakes products
INSERT INTO product_variants (id, product_id, packaging_size, price, original_price, discount_percentage, stock_quantity, weight_kg)
SELECT 
  gen_random_uuid(),
  p.id,
  v.size,
  ROUND(p.base_price * v.multiplier * 1.15, 2),
  ROUND(p.base_price * v.multiplier * 1.15, 2),
  v.discount,
  100,
  v.weight
FROM products p
CROSS JOIN (
  VALUES 
    ('1kg', 1, 0, 1.0),
    ('2kg', 2, 0, 2.0),
    ('5kg', 5, 2, 5.0),
    ('10kg', 10, 3, 10.0)
) AS v(size, multiplier, discount, weight)
WHERE p.product_code IN ('FLAKES007', 'FLAKES008', 'FLAKES009', 'FLAKES010', 'FLAKES011', 'FLAKES012', 'FLAKES013', 'FLAKES014');

-- Step 4: Update discounted prices for 5kg and 10kg variants
UPDATE product_variants pv
SET price = ROUND(original_price * (1 - discount_percentage / 100.0), 2)
FROM products p
WHERE pv.product_id = p.id
  AND p.product_code IN ('FLAKES007', 'FLAKES008', 'FLAKES009', 'FLAKES010', 'FLAKES011', 'FLAKES012', 'FLAKES013', 'FLAKES014')
  AND pv.discount_percentage > 0;