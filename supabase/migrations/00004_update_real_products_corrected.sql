/*
# Update Products with Real Data

Replace sample data with actual Srilaya Enterprises products with Indian Rupee pricing.

## Products Added
- 6 Rice varieties
- 10 Flour products
- 7 Flakes products
- 11 Millets products
- 6 Honey products

Total: 40 products with multiple packaging variants each
*/

-- Delete existing data
DELETE FROM product_variants;
DELETE FROM products;

-- Add product_code column
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code TEXT UNIQUE;

-- Rice Products
INSERT INTO products (id, product_code, name, category, description, base_price) VALUES
(gen_random_uuid(), 'RICE001', 'Parboiled Rice', 'rice', 'Premium quality parboiled rice, nutritious and easy to cook', 94.50),
(gen_random_uuid(), 'RICE002', 'Mapillai Samba', 'rice', 'Traditional red rice variety, rich in nutrients and fiber', 98.44),
(gen_random_uuid(), 'RICE003', 'Poongar Rice', 'rice', 'Ancient rice variety known for its medicinal properties', 74.81),
(gen_random_uuid(), 'RICE004', 'Tooyamalli Rice', 'rice', 'Aromatic traditional rice with unique flavor', 84.00),
(gen_random_uuid(), 'RICE005', 'Karupukavuni', 'rice', 'Black rice variety, rich in antioxidants', 190.31),
(gen_random_uuid(), 'RICE006', 'White Ponni', 'rice', 'Popular South Indian rice variety, soft and fluffy', 93.19);

-- Flour Products
INSERT INTO products (id, product_code, name, category, description, base_price) VALUES
(gen_random_uuid(), 'FLOUR001', 'Foxtail Flour', 'flakes', 'Nutritious millet flour, gluten-free', 87.94),
(gen_random_uuid(), 'FLOUR002', 'Little Flour', 'flakes', 'Fine millet flour for various recipes', 87.94),
(gen_random_uuid(), 'FLOUR003', 'Browntop Flour', 'flakes', 'Rare millet flour, high nutrition', 87.94),
(gen_random_uuid(), 'FLOUR004', 'Barnyard Flour', 'flakes', 'Low glycemic flour, diabetic-friendly', 87.94),
(gen_random_uuid(), 'FLOUR005', 'Ragi Flour', 'flakes', 'Finger millet flour, calcium-rich', 56.44),
(gen_random_uuid(), 'FLOUR006', 'Natty Pearl Flour', 'flakes', 'Pearl millet flour, natural goodness', 74.81),
(gen_random_uuid(), 'FLOUR007', 'Pearl Flour', 'flakes', 'Fine pearl millet flour', 59.06),
(gen_random_uuid(), 'FLOUR008', 'Sorghum Flour', 'flakes', 'Jowar flour, gluten-free', 61.69),
(gen_random_uuid(), 'FLOUR009', 'Proso Flour', 'flakes', 'Proso millet flour, mild flavor', 72.19),
(gen_random_uuid(), 'FLOUR010', 'Millet Flour', 'flakes', 'Economical millet flour', 59.06);

-- Flakes Products
INSERT INTO products (id, product_code, name, category, description, base_price) VALUES
(gen_random_uuid(), 'FLAKES001', 'Foxtail Flakes', 'flakes', 'Crispy foxtail millet flakes', 131.25),
(gen_random_uuid(), 'FLAKES002', 'Little Flakes', 'flakes', 'Nutritious little millet flakes', 144.38),
(gen_random_uuid(), 'FLAKES003', 'Kodo Flakes', 'flakes', 'Healthy kodo millet flakes', 133.88),
(gen_random_uuid(), 'FLAKES004', 'Barnyard Flakes', 'flakes', 'Low-carb barnyard flakes', 147.00),
(gen_random_uuid(), 'FLAKES005', 'Ragi Flakes', 'flakes', 'Calcium-rich finger millet flakes', 89.25),
(gen_random_uuid(), 'FLAKES006', 'Pearl Flakes', 'flakes', 'Crunchy pearl millet flakes', 90.56),
(gen_random_uuid(), 'FLAKES007', 'Sorghum Flakes', 'flakes', 'Wholesome sorghum flakes', 90.56);

-- Millets Products
INSERT INTO products (id, product_code, name, category, description, base_price) VALUES
(gen_random_uuid(), 'MILLETS001', 'Foxtail Rice', 'millets', 'Foxtail millet rice, gluten-free', 86.63),
(gen_random_uuid(), 'MILLETS002', 'Little Rice', 'millets', 'Little millet rice, high fiber', 118.13),
(gen_random_uuid(), 'MILLETS003', 'Kodo Rice', 'millets', 'Kodo millet rice, easy digest', 87.94),
(gen_random_uuid(), 'MILLETS004', 'Barnyard Rice', 'millets', 'Barnyard millet, low glycemic', 133.88),
(gen_random_uuid(), 'MILLETS005', 'Browntop Rice', 'millets', 'Rare browntop millet rice', 103.69),
(gen_random_uuid(), 'MILLETS006', 'Proso Rice', 'millets', 'Proso millet rice, mild taste', 110.25),
(gen_random_uuid(), 'MILLETS007', 'Ragi', 'millets', 'Finger millet, calcium rich', 56.44),
(gen_random_uuid(), 'MILLETS008', 'Native Pearl', 'millets', 'Native pearl millet variety', 72.19),
(gen_random_uuid(), 'MILLETS009', 'Pearl', 'millets', 'Pearl millet, protein-rich', 49.88),
(gen_random_uuid(), 'MILLETS010', 'Sorghum White', 'millets', 'White sorghum, versatile', 72.19),
(gen_random_uuid(), 'MILLETS011', 'Sorghum Red', 'millets', 'Red sorghum, antioxidants', 73.50);

-- Honey Products
INSERT INTO products (id, product_code, name, category, description, base_price) VALUES
(gen_random_uuid(), 'HONEY001', 'Cave Black Honey', 'honey', 'Rare cave-sourced black honey', 872.81),
(gen_random_uuid(), 'HONEY002', 'Siru Honey', 'honey', 'Traditional small bee honey', 872.81),
(gen_random_uuid(), 'HONEY003', 'Kombu Honey', 'honey', 'Wild forest honey, unique flavor', 872.81),
(gen_random_uuid(), 'HONEY004', 'Honey & Fig', 'honey', 'Premium honey infused with figs', 872.81),
(gen_random_uuid(), 'HONEY005', 'Honey & Amla', 'honey', 'Honey with Indian gooseberry', 872.81),
(gen_random_uuid(), 'HONEY006', 'Rose Petals Honey', 'honey', 'Aromatic honey with rose petals', 1004.06);

-- Variants for Rice, Flakes, Millets (1kg, 2kg, 5kg, 10kg)
INSERT INTO product_variants (product_id, packaging_size, price, stock)
SELECT id, '1kg', ROUND(base_price::numeric, 2), 100
FROM products WHERE category IN ('rice', 'flakes', 'millets');

INSERT INTO product_variants (product_id, packaging_size, price, stock)
SELECT id, '2kg', ROUND((base_price * 2)::numeric, 2), 100
FROM products WHERE category IN ('rice', 'flakes', 'millets');

INSERT INTO product_variants (product_id, packaging_size, price, stock)
SELECT id, '5kg', ROUND((base_price * 5)::numeric, 2), 100
FROM products WHERE category IN ('rice', 'flakes', 'millets');

INSERT INTO product_variants (product_id, packaging_size, price, stock)
SELECT id, '10kg', ROUND((base_price * 10)::numeric, 2), 50
FROM products WHERE category IN ('rice', 'flakes', 'millets');

-- Variants for Honey (250g, 500g, 1kg)
INSERT INTO product_variants (product_id, packaging_size, price, stock)
SELECT id, '250g', ROUND((base_price * 0.25)::numeric, 2), 100
FROM products WHERE category = 'honey';

INSERT INTO product_variants (product_id, packaging_size, price, stock)
SELECT id, '500g', ROUND((base_price * 0.5)::numeric, 2), 100
FROM products WHERE category = 'honey';

INSERT INTO product_variants (product_id, packaging_size, price, stock)
SELECT id, '1kg', ROUND(base_price::numeric, 2), 50
FROM products WHERE category = 'honey';
