/*
# Update Products with Real Data

This migration replaces sample data with actual Srilaya Enterprises products.

## Changes
1. Delete existing sample products and variants
2. Insert real products from the provided list
3. Create variants with actual pricing in Indian Rupees (₹)
4. Products organized by categories: Rice, Flour, Flakes, Millets, Honey

## Pricing Structure
- All prices in Indian Rupees (INR)
- Cost price, selling price, GST, and final price included
- Standard packaging: 1kg base price (from final price per kg)
- Variants: 1kg, 2kg, 5kg, 10kg with proportional pricing

## Categories
- Rice: 6 products
- Flour: 10 products  
- Flakes: 7 products
- Millets: 11 products
- Honey: 6 products
*/

-- Delete existing sample data
DELETE FROM product_variants;
DELETE FROM products;

-- Insert Rice Products
INSERT INTO products (id, name, category, description, base_price) VALUES
('RICE001', 'Parboiled Rice', 'rice', 'Premium quality parboiled rice, nutritious and easy to cook', 94.50),
('RICE002', 'Mapillai Samba', 'rice', 'Traditional red rice variety, rich in nutrients and fiber', 98.44),
('RICE003', 'Poongar Rice', 'rice', 'Ancient rice variety known for its medicinal properties', 74.81),
('RICE004', 'Tooyamalli Rice', 'rice', 'Aromatic traditional rice with unique flavor', 84.00),
('RICE005', 'Karupukavuni', 'rice', 'Black rice variety, rich in antioxidants', 190.31),
('RICE006', 'White Ponni', 'rice', 'Popular South Indian rice variety, soft and fluffy', 93.19);

-- Insert Flour Products
INSERT INTO products (id, name, category, description, base_price) VALUES
('FLOUR001', 'Foxtail Flour', 'flakes', 'Nutritious millet flour, gluten-free and healthy', 87.94),
('FLOUR002', 'Little Flour', 'flakes', 'Fine millet flour perfect for various recipes', 87.94),
('FLOUR003', 'Browntop Flour', 'flakes', 'Rare millet flour with high nutritional value', 87.94),
('FLOUR004', 'Barnyard Flour', 'flakes', 'Low glycemic index flour, ideal for diabetics', 87.94),
('FLOUR005', 'Ragi Flour', 'flakes', 'Finger millet flour, rich in calcium and iron', 56.44),
('FLOUR006', 'Natty Pearl Flour', 'flakes', 'Pearl millet flour with natural goodness', 74.81),
('FLOUR007', 'Pearl Flour', 'flakes', 'Fine pearl millet flour for healthy cooking', 59.06),
('FLOUR008', 'Sorghum Flour', 'flakes', 'Jowar flour, gluten-free and protein-rich', 61.69),
('FLOUR009', 'Proso Flour', 'flakes', 'Proso millet flour with mild flavor', 72.19),
('FLOUR010', 'Millet Flour (From Broken Millet Rice)', 'flakes', 'Economical millet flour from broken rice', 59.06);

-- Insert Flakes Products
INSERT INTO products (id, name, category, description, base_price) VALUES
('FLAKES001', 'Foxtail Flakes', 'flakes', 'Crispy foxtail millet flakes for breakfast', 131.25),
('FLAKES002', 'Little Flakes', 'flakes', 'Nutritious little millet flakes', 144.38),
('FLAKES003', 'Kodo Flakes', 'flakes', 'Healthy kodo millet flakes', 133.88),
('FLAKES004', 'Barnyard Flakes', 'flakes', 'Low-carb barnyard millet flakes', 147.00),
('FLAKES005', 'Ragi Flakes', 'flakes', 'Calcium-rich finger millet flakes', 89.25),
('FLAKES006', 'Pearl Flakes', 'flakes', 'Crunchy pearl millet flakes', 90.56),
('FLAKES007', 'Sorghum Flakes', 'flakes', 'Wholesome sorghum flakes', 90.56);

-- Insert Millets Products
INSERT INTO products (id, name, category, description, base_price) VALUES
('MILLETS001', 'Foxtail Rice', 'millets', 'Foxtail millet rice, gluten-free superfood', 86.63),
('MILLETS002', 'Little Rice', 'millets', 'Little millet rice with high fiber content', 118.13),
('MILLETS003', 'Kodo Rice', 'millets', 'Kodo millet rice, easy to digest', 87.94),
('MILLETS004', 'Barnyard Rice', 'millets', 'Barnyard millet rice, low glycemic index', 133.88),
('MILLETS005', 'Browntop Rice', 'millets', 'Rare browntop millet rice', 103.69),
('MILLETS006', 'Proso Rice', 'millets', 'Proso millet rice with mild taste', 110.25),
('MILLETS007', 'Ragi', 'millets', 'Finger millet, calcium powerhouse', 56.44),
('MILLETS008', 'Native Pearl', 'millets', 'Native pearl millet variety', 72.19),
('MILLETS009', 'Pearl', 'millets', 'Pearl millet, protein-rich grain', 49.88),
('MILLETS010', 'Sorghum (White)', 'millets', 'White sorghum, versatile grain', 72.19),
('MILLETS011', 'Sorghum (Red)', 'millets', 'Red sorghum with antioxidants', 73.50);

-- Insert Honey Products
INSERT INTO products (id, name, category, description, base_price) VALUES
('HONEY001', 'Cave Black Honey', 'honey', 'Rare cave-sourced black honey, pure and natural', 872.81),
('HONEY002', 'Siru Honey', 'honey', 'Traditional small bee honey, medicinal properties', 872.81),
('HONEY003', 'Kombu Honey', 'honey', 'Wild forest honey with unique flavor', 872.81),
('HONEY004', 'Honey & Fig', 'honey', 'Premium honey infused with figs', 872.81),
('HONEY005', 'Honey & Amla', 'honey', 'Honey blended with Indian gooseberry', 872.81),
('HONEY006', 'Rose Petals Honey', 'honey', 'Aromatic honey with rose petals', 1004.06);

-- Insert variants for Rice, Flour, Flakes, and Millets (1kg, 2kg, 5kg, 10kg)
INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '1kg',
  base_price,
  100
FROM products 
WHERE category IN ('rice', 'flakes', 'millets');

INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '2kg',
  base_price * 2,
  100
FROM products 
WHERE category IN ('rice', 'flakes', 'millets');

INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '5kg',
  base_price * 5,
  100
FROM products 
WHERE category IN ('rice', 'flakes', 'millets');

INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '10kg',
  base_price * 10,
  50
FROM products 
WHERE category IN ('rice', 'flakes', 'millets');

-- Insert variants for Honey (250g, 500g, 1kg)
INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '250g',
  base_price * 0.25,
  100
FROM products 
WHERE category = 'honey';

INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '500g',
  base_price * 0.5,
  100
FROM products 
WHERE category = 'honey';

INSERT INTO product_variants (product_id, packaging_size, price, stock_quantity)
SELECT 
  id,
  '1kg',
  base_price,
  50
FROM products 
WHERE category = 'honey';
