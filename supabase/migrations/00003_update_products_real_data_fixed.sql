/*
# Update Products with Real Data (Fixed)

This migration replaces sample data with actual Srilaya Enterprises products.

## Changes
1. Delete existing sample products and variants
2. Insert real products from the provided list with proper UUIDs
3. Create variants with actual pricing in Indian Rupees (₹)
4. Products organized by categories: Rice, Flour, Flakes, Millets, Honey
5. Add product_code field to store original product IDs (RICE001, etc.)

## Pricing Structure
- All prices in Indian Rupees (INR)
- Base price is the final price per kg from the spreadsheet
- Variants: 1kg, 2kg, 5kg, 10kg with proportional pricing
- Honey: 250g, 500g, 1kg variants

## Categories
- Rice: 6 products
- Flour: 10 products (categorized as flakes for now)
- Flakes: 7 products
- Millets: 11 products
- Honey: 6 products
*/

-- Delete existing sample data
DELETE FROM product_variants;
DELETE FROM products;

-- Add product_code column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code TEXT UNIQUE;

-- Insert Rice Products
INSERT INTO products (id, product_code, name, category, description, base_price) VALUES
(gen_random_uuid(), 'RICE001', 'Parboiled Rice', 'rice', 'Premium quality parboiled rice, nutritious and easy to cook', 94.50),
(gen_random_uuid(), 'RICE002', 'Mapillai Samba', 'rice', 'Traditional red rice variety, rich in nutrients and fiber', 98.44),
(gen_random_uuid(), 'RICE003', 'Poongar Rice', 'rice', 'Ancient rice variety known for its medicinal properties', 74.81),
(gen_random_uuid(), 'RICE004', 'Tooyamalli Rice', 'rice', 'Aromatic traditional rice with unique flavor', 84.00),
(gen_random_uuid(), 'RICE005', 'Karupukavuni', 'rice', 'Black rice variety, rich in antioxidants', 190.31),
(gen_random_uuid(), 'RICE006', 'White Ponni', 'rice', 'Popular South Indian rice variety, soft and fluffy', 93.19);

-- Insert Flour Products (using flakes category)
INSERT INTO products (id, product_code, name, category, description, base_price) VALUES
(gen_random_uuid(), 'FLOUR001', 'Foxtail Flour', 'flakes', 'Nutritious millet flour, gluten-free and healthy', 87.94),
(gen_random_uuid(), 'FLOUR002', 'Little Flour', 'flakes', 'Fine millet flour perfect for various recipes', 87.94),
(gen_random_uuid(), 'FLOUR003', 'Browntop Flour', 'flakes', 'Rare millet flour with high nutritional value', 87.94),
(gen_random_uuid(), 'FLOUR004', 'Barnyard Flour', 'flakes', 'Low glycemic index flour, ideal for diabetics', 87.94),
(gen_random_uuid(), 'FLOUR005', 'Ragi Flour', 'flakes', 'Finger millet flour, rich in calcium and iron', 56.44),
(gen_random_uuid(), 'FLOUR006', 'Natty Pearl Flour', 'flakes', 'Pearl millet flour with natural goodness', 74.81),
(gen_random_uuid(), 'FLOUR007', 'Pearl Flour', 'flakes', 'Fine pearl millet flour for healthy cooking', 59.06),
(gen_random_uuid(), 'FLOUR008', 'Sorghum Flour', 'flakes', 'Jowar flour, gluten-free and protein-rich', 61.69),
(gen_random_uuid(), 'FLOUR009', 'Proso Flour', 'flakes', 'Proso millet flour with mild flavor', 72.19),
(gen_random_uuid(), 'FLOUR010', 'Millet Flour', 'flakes', 'Economical millet flour from broken rice', 59.06);

-- Insert Flakes Products
INSERT INTO products (id, product_code, name, category, description, base_price) VALUES
(gen_random_uuid(), 'FLAKES001', 'Foxtail Flakes', 'flakes', 'Crispy foxtail millet flakes for breakfast', 131.25),
(gen_random_uuid(), 'FLAKES002', 'Little Flakes', 'flakes', 'Nutritious little millet flakes', 144.38),
(gen_random_uuid(), 'FLAKES003', 'Kodo Flakes', 'flakes', 'Healthy kodo millet flakes', 133.88),
(gen_random_uuid(), 'FLAKES004', 'Barnyard Flakes', 'flakes', 'Low-carb barnyard millet flakes', 147.00),
(gen_random_uuid(), 'FLAKES005', 'Ragi Flakes', 'flakes', 'Calcium-rich finger millet flakes', 89.25),
(gen_random_uuid(), 'FLAKES006', 'Pearl Flakes', 'flakes', 'Crunchy pearl millet flakes', 90.56),
(gen_random_uuid(), 'FLAKES007', 'Sorghum Flakes', 'flakes', 'Wholesome sorghum flakes', 90.56);

-- Insert Millets Products
INSERT INTO products (id, product_code, name, category, description, base_price) VALUES
(gen_random_uuid(), 'MILLETS001', 'Foxtail Rice', 'millets', 'Foxtail millet rice, gluten-free superfood', 86.63),
(gen_random_uuid(), 'MILLETS002', 'Little Rice', 'millets', 'Little millet rice with high fiber content', 118.13),
(gen_random_uuid(), 'MILLETS003', 'Kodo Rice', 'millets', 'Kodo millet rice, easy to digest', 87.94),
(gen_random_uuid(), 'MILLETS004', 'Barnyard Rice', 'millets', 'Barnyard millet rice, low glycemic index', 133.88),
(gen_random_uuid(), 'MILLETS005', 'Browntop Rice', 'millets', 'Rare browntop millet rice', 103.69),
(gen_random_uuid(), 'MILLETS006', 'Proso Rice', 'millets', 'Proso millet rice with mild taste', 110.25),
(gen_random_uuid(), 'MILLETS007', 'Ragi', 'millets', 'Finger millet, calcium powerhouse', 56.44),
(gen_random_uuid(), 'MILLETS008', 'Native Pearl', 'millets', 'Native pearl millet variety', 72.19),
(gen_random_uuid(), 'MILLETS009', 'Pearl', 'millets', 'Pearl millet, protein-rich grain', 49.88),
(gen_random_uuid(), 'MILLETS010', 'Sorghum White', 'millets', 'White sorghum, versatile grain', 72.19),
(gen_random_uuid(), 'MILLETS011', 'Sorghum Red', 'millets', 'Red sorghum with antioxidants', 73.50);

-- Insert Honey Products
INSERT INTO products (id, product_code, name, category, description, base_price) VALUES
(gen_random_uuid(), 'HONEY001', 'Cave Black Honey', 'honey', 'Rare cave-sourced black honey, pure and natural', 872.81),
(gen_random_uuid(), 'HONEY002', 'Siru Honey', 'honey', 'Traditional small bee honey, medicinal properties', 872.81),
(gen_random_uuid(), 'HONEY003', 'Kombu Honey', 'honey', 'Wild forest honey with unique flavor', 872.81),
(gen_random_uuid(), 'HONEY004', 'Honey & Fig', 'honey', 'Premium honey infused with figs', 872.81),
(gen_random_uuid(), 'HONEY005', 'Honey & Amla', 'honey', 'Honey blended with Indian gooseberry', 872.81),
(gen_random_uuid(), 'HONEY006', 'Rose Petals Honey', 'honey', 'Aromatic honey with rose petals', 1004.06);

-- Insert variants for Rice, Flakes, and Millets (1kg, 2kg, 5kg, 10kg)
INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '1kg',
  ROUND(base_price::numeric, 2),
  100
FROM products 
WHERE category IN ('rice', 'flakes', 'millets');

INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '2kg',
  ROUND((base_price * 2)::numeric, 2),
  100
FROM products 
WHERE category IN ('rice', 'flakes', 'millets');

INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '5kg',
  ROUND((base_price * 5)::numeric, 2),
  100
FROM products 
WHERE category IN ('rice', 'flakes', 'millets');

INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '10kg',
  ROUND((base_price * 10)::numeric, 2),
  50
FROM products 
WHERE category IN ('rice', 'flakes', 'millets');

-- Insert variants for Honey (250g, 500g, 1kg)
INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '250g',
  ROUND((base_price * 0.25)::numeric, 2),
  100
FROM products 
WHERE category = 'honey';

INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '500g',
  ROUND((base_price * 0.5)::numeric, 2),
  100
FROM products 
WHERE category = 'honey';

INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '1kg',
  ROUND(base_price::numeric, 2),
  50
FROM products 
WHERE category = 'honey';
