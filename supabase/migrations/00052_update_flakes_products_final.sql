/*
# Update Flakes Category Products - Final Version

Removes old Sorghum Flakes and adds 8 new flakes products with proper variants
*/

-- Step 1: Delete old Sorghum Flakes
DELETE FROM product_variants WHERE product_id IN (
  SELECT id FROM products WHERE product_code = 'FLAKES007'
);
DELETE FROM products WHERE product_code = 'FLAKES007';

-- Step 2: Insert new flakes products
INSERT INTO products (id, product_code, name, category, description, base_price, stock, is_active)
VALUES
  (gen_random_uuid(), 'FLAKES007', 'Red Sorghum Flakes', 'flakes', 'Nutritious red sorghum flakes, rich in antioxidants', 92.00, 400, true),
  (gen_random_uuid(), 'FLAKES008', 'White Sorghum Flakes', 'flakes', 'Light and crispy white sorghum flakes', 90.00, 400, true),
  (gen_random_uuid(), 'FLAKES009', 'Green Gram Flakes', 'flakes', 'Protein-rich green gram flakes', 95.00, 400, true),
  (gen_random_uuid(), 'FLAKES010', 'Horse Gram Flakes', 'flakes', 'High-protein horse gram flakes', 98.00, 400, true),
  (gen_random_uuid(), 'FLAKES011', 'Wheat Flakes', 'flakes', 'Wholesome wheat flakes for healthy breakfast', 85.00, 400, true),
  (gen_random_uuid(), 'FLAKES012', 'Barley Flakes', 'flakes', 'Fiber-rich barley flakes', 88.00, 400, true),
  (gen_random_uuid(), 'FLAKES013', 'Karupukavini Rice Flakes', 'flakes', 'Traditional black rice flakes, nutrient-dense', 120.00, 400, true),
  (gen_random_uuid(), 'FLAKES014', 'Mapillai Sambha Rice Flakes', 'flakes', 'Premium red rice flakes with medicinal properties', 125.00, 400, true);

-- Step 3: Create variants for all new products
INSERT INTO product_variants (id, product_id, packaging_size, price, cost_price, discount_percentage, stock, weight_kg)
SELECT 
  gen_random_uuid(),
  p.id,
  v.size,
  ROUND(p.base_price * v.multiplier * 1.15 * (1 - v.discount / 100.0), 2),
  ROUND(p.base_price * v.multiplier, 2),
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