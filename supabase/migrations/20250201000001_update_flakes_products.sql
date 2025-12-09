/*
# Update Flakes Category Products

1. Changes
   - Remove: Sorghum Flakes (FLAKES007)
   - Add 8 new flakes products:
     * Red Sorghum Flakes (FLAKES007)
     * White Sorghum Flakes (FLAKES008)
     * Green Gram Flakes (FLAKES009)
     * Horse Gram Flakes (FLAKES010)
     * Wheat Flakes (FLAKES011)
     * Barley Flakes (FLAKES012)
     * Karupukavini Rice Flakes (FLAKES013)
     * Mapillai Sambha Rice Flakes (FLAKES014)

2. Product Details
   - All new products follow the same pricing structure as existing flakes
   - Standard packaging: 1kg, 2kg, 5kg, 10kg
   - Discount policy: 2% for 5kg, 3% for 10kg
   - GST: 5%

3. Notes
   - Total flakes products increased from 7 to 14
   - Product codes maintained in sequence
*/

-- Step 1: Delete the old Sorghum Flakes product and its variants
DELETE FROM product_variants WHERE product_id IN (
  SELECT id FROM products WHERE product_code = 'FLAKES007' AND name = 'Sorghum Flakes'
);

DELETE FROM products WHERE product_code = 'FLAKES007' AND name = 'Sorghum Flakes';

-- Step 2: Insert new flakes products
INSERT INTO products (id, product_code, name, category, description, cost_price)
VALUES
  -- Red Sorghum Flakes
  (gen_random_uuid(), 'FLAKES007', 'Red Sorghum Flakes', 'flakes', 'Nutritious red sorghum flakes, rich in antioxidants', 92.00),
  -- White Sorghum Flakes
  (gen_random_uuid(), 'FLAKES008', 'White Sorghum Flakes', 'flakes', 'Light and crispy white sorghum flakes', 90.00),
  -- Green Gram Flakes
  (gen_random_uuid(), 'FLAKES009', 'Green Gram Flakes', 'flakes', 'Protein-rich green gram flakes', 95.00),
  -- Horse Gram Flakes
  (gen_random_uuid(), 'FLAKES010', 'Horse Gram Flakes', 'flakes', 'High-protein horse gram flakes', 98.00),
  -- Wheat Flakes
  (gen_random_uuid(), 'FLAKES011', 'Wheat Flakes', 'flakes', 'Wholesome wheat flakes for healthy breakfast', 85.00),
  -- Barley Flakes
  (gen_random_uuid(), 'FLAKES012', 'Barley Flakes', 'flakes', 'Fiber-rich barley flakes', 88.00),
  -- Karupukavini Rice Flakes
  (gen_random_uuid(), 'FLAKES013', 'Karupukavini Rice Flakes', 'flakes', 'Traditional black rice flakes, nutrient-dense', 120.00),
  -- Mapillai Sambha Rice Flakes
  (gen_random_uuid(), 'FLAKES014', 'Mapillai Sambha Rice Flakes', 'flakes', 'Premium red rice flakes with medicinal properties', 125.00);

-- Step 3: Create variants for all new flakes products (1kg, 2kg, 5kg, 10kg)
-- FLAKES007: Red Sorghum Flakes
INSERT INTO product_variants (id, product_id, packaging_size, price, original_price, discount_percentage, stock_quantity, weight_kg)
SELECT 
  gen_random_uuid(),
  p.id,
  v.size,
  ROUND(p.cost_price * v.multiplier * 1.15, 2), -- 15% markup
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
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
WHERE p.product_code = 'FLAKES007';

-- FLAKES008: White Sorghum Flakes
INSERT INTO product_variants (id, product_id, packaging_size, price, original_price, discount_percentage, stock_quantity, weight_kg)
SELECT 
  gen_random_uuid(),
  p.id,
  v.size,
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
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
WHERE p.product_code = 'FLAKES008';

-- FLAKES009: Green Gram Flakes
INSERT INTO product_variants (id, product_id, packaging_size, price, original_price, discount_percentage, stock_quantity, weight_kg)
SELECT 
  gen_random_uuid(),
  p.id,
  v.size,
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
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
WHERE p.product_code = 'FLAKES009';

-- FLAKES010: Horse Gram Flakes
INSERT INTO product_variants (id, product_id, packaging_size, price, original_price, discount_percentage, stock_quantity, weight_kg)
SELECT 
  gen_random_uuid(),
  p.id,
  v.size,
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
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
WHERE p.product_code = 'FLAKES010';

-- FLAKES011: Wheat Flakes
INSERT INTO product_variants (id, product_id, packaging_size, price, original_price, discount_percentage, stock_quantity, weight_kg)
SELECT 
  gen_random_uuid(),
  p.id,
  v.size,
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
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
WHERE p.product_code = 'FLAKES011';

-- FLAKES012: Barley Flakes
INSERT INTO product_variants (id, product_id, packaging_size, price, original_price, discount_percentage, stock_quantity, weight_kg)
SELECT 
  gen_random_uuid(),
  p.id,
  v.size,
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
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
WHERE p.product_code = 'FLAKES012';

-- FLAKES013: Karupukavini Rice Flakes
INSERT INTO product_variants (id, product_id, packaging_size, price, original_price, discount_percentage, stock_quantity, weight_kg)
SELECT 
  gen_random_uuid(),
  p.id,
  v.size,
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
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
WHERE p.product_code = 'FLAKES013';

-- FLAKES014: Mapillai Sambha Rice Flakes
INSERT INTO product_variants (id, product_id, packaging_size, price, original_price, discount_percentage, stock_quantity, weight_kg)
SELECT 
  gen_random_uuid(),
  p.id,
  v.size,
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
  ROUND(p.cost_price * v.multiplier * 1.15, 2),
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
WHERE p.product_code = 'FLAKES014';

-- Step 4: Update discounted prices for 5kg and 10kg variants
UPDATE product_variants pv
SET price = ROUND(original_price * (1 - discount_percentage / 100.0), 2)
FROM products p
WHERE pv.product_id = p.id
  AND p.product_code IN ('FLAKES007', 'FLAKES008', 'FLAKES009', 'FLAKES010', 'FLAKES011', 'FLAKES012', 'FLAKES013', 'FLAKES014')
  AND pv.discount_percentage > 0;
