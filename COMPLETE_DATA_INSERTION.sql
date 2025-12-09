-- ============================================================================
-- SRILAYA ENTERPRISES ORGANIC STORE - COMPLETE DATA INSERTION
-- Database: PostgreSQL (Supabase)
-- Version: 1.0
-- Date: 2025-12-01
-- ============================================================================

-- ============================================================================
-- SECTION 1: PRODUCTS DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1.1 MILLETS CATEGORY (9 Products)
-- ----------------------------------------------------------------------------
INSERT INTO products (id, product_code, name, category, description, base_price, stock, is_active)
VALUES
    (gen_random_uuid(), 'MILLET001', 'Foxtail Millet', 'millets', 'Nutritious foxtail millet, rich in protein and fiber', 131.25, 400, true),
    (gen_random_uuid(), 'MILLET002', 'Little Millet', 'millets', 'Small grain millet with high nutritional value', 144.38, 400, true),
    (gen_random_uuid(), 'MILLET003', 'Browntop Millet', 'millets', 'Rare millet variety with exceptional health benefits', 144.38, 400, true),
    (gen_random_uuid(), 'MILLET004', 'Kodo Millet', 'millets', 'Ancient grain, excellent for diabetics', 133.88, 400, true),
    (gen_random_uuid(), 'MILLET005', 'Barnyard Millet', 'millets', 'Low glycemic index, perfect for weight management', 147.00, 400, true),
    (gen_random_uuid(), 'MILLET006', 'Ragi (Finger Millet)', 'millets', 'Calcium-rich finger millet for strong bones', 89.25, 400, true),
    (gen_random_uuid(), 'MILLET007', 'Natty Pearl Millet', 'millets', 'Natural pearl millet with authentic taste', 118.13, 400, true),
    (gen_random_uuid(), 'MILLET008', 'Pearl Millet', 'millets', 'Versatile pearl millet for various dishes', 90.56, 400, true),
    (gen_random_uuid(), 'MILLET009', 'Proso Millet', 'millets', 'Mild-flavored millet, easy to digest', 114.19, 400, true);

-- ----------------------------------------------------------------------------
-- 1.2 RICE CATEGORY (4 Products)
-- ----------------------------------------------------------------------------
INSERT INTO products (id, product_code, name, category, description, base_price, stock, is_active)
VALUES
    (gen_random_uuid(), 'RICE001', 'Karupukavini Rice', 'rice', 'Traditional black rice with medicinal properties', 196.88, 400, true),
    (gen_random_uuid(), 'RICE002', 'Mapillai Sambha Rice', 'rice', 'Premium red rice known for health benefits', 196.88, 400, true),
    (gen_random_uuid(), 'RICE003', 'Seeraga Samba Rice', 'rice', 'Aromatic rice perfect for biryani', 196.88, 400, true),
    (gen_random_uuid(), 'RICE004', 'Kaiviral Samba Rice', 'rice', 'Traditional rice variety with unique taste', 196.88, 400, true);

-- ----------------------------------------------------------------------------
-- 1.3 FLAKES CATEGORY (14 Products) ⭐ UPDATED
-- ----------------------------------------------------------------------------
INSERT INTO products (id, product_code, name, category, description, base_price, stock, is_active)
VALUES
    (gen_random_uuid(), 'FLAKES001', 'Foxtail Flakes', 'flakes', 'Crispy foxtail millet flakes', 131.25, 400, true),
    (gen_random_uuid(), 'FLAKES002', 'Little Flakes', 'flakes', 'Nutritious little millet flakes', 144.38, 400, true),
    (gen_random_uuid(), 'FLAKES003', 'Kodo Flakes', 'flakes', 'Healthy kodo millet flakes', 133.88, 400, true),
    (gen_random_uuid(), 'FLAKES004', 'Barnyard Flakes', 'flakes', 'Low-carb barnyard flakes', 147.00, 400, true),
    (gen_random_uuid(), 'FLAKES005', 'Ragi Flakes', 'flakes', 'Calcium-rich finger millet flakes', 89.25, 400, true),
    (gen_random_uuid(), 'FLAKES006', 'Pearl Flakes', 'flakes', 'Crunchy pearl millet flakes', 90.56, 400, true),
    (gen_random_uuid(), 'FLAKES007', 'Red Sorghum Flakes', 'flakes', 'Nutritious red sorghum flakes, rich in antioxidants', 92.00, 400, true),
    (gen_random_uuid(), 'FLAKES008', 'White Sorghum Flakes', 'flakes', 'Light and crispy white sorghum flakes', 90.00, 400, true),
    (gen_random_uuid(), 'FLAKES009', 'Green Gram Flakes', 'flakes', 'Protein-rich green gram flakes', 95.00, 400, true),
    (gen_random_uuid(), 'FLAKES010', 'Horse Gram Flakes', 'flakes', 'High-protein horse gram flakes', 98.00, 400, true),
    (gen_random_uuid(), 'FLAKES011', 'Wheat Flakes', 'flakes', 'Wholesome wheat flakes for healthy breakfast', 85.00, 400, true),
    (gen_random_uuid(), 'FLAKES012', 'Barley Flakes', 'flakes', 'Fiber-rich barley flakes', 88.00, 400, true),
    (gen_random_uuid(), 'FLAKES013', 'Karupukavini Rice Flakes', 'flakes', 'Traditional black rice flakes, nutrient-dense', 120.00, 400, true),
    (gen_random_uuid(), 'FLAKES014', 'Mapillai Sambha Rice Flakes', 'flakes', 'Premium red rice flakes with medicinal properties', 125.00, 400, true);

-- ----------------------------------------------------------------------------
-- 1.4 SUGAR CATEGORY (2 Products)
-- ----------------------------------------------------------------------------
INSERT INTO products (id, product_code, name, category, description, base_price, stock, is_active)
VALUES
    (gen_random_uuid(), 'SUGAR001', 'Jaggery Powder', 'sugar', 'Pure jaggery powder, natural sweetener', 98.44, 400, true),
    (gen_random_uuid(), 'SUGAR002', 'Palm Jaggery', 'sugar', 'Traditional palm jaggery, rich in minerals', 131.25, 400, true);

-- ----------------------------------------------------------------------------
-- 1.5 HONEY CATEGORY (1 Product)
-- ----------------------------------------------------------------------------
INSERT INTO products (id, product_code, name, category, description, base_price, stock, is_active)
VALUES
    (gen_random_uuid(), 'HONEY001', 'Pure Organic Honey', 'honey', '100% pure organic honey from natural sources', 393.75, 400, true);

-- ----------------------------------------------------------------------------
-- 1.6 LADDUS CATEGORY (1 Product)
-- ----------------------------------------------------------------------------
INSERT INTO products (id, product_code, name, category, description, base_price, stock, is_active)
VALUES
    (gen_random_uuid(), 'LADDU001', 'Ragi Laddu', 'laddus', 'Healthy ragi laddus, perfect for energy', 196.88, 400, true);

-- ----------------------------------------------------------------------------
-- 1.7 FLOUR CATEGORY (10 Products)
-- ----------------------------------------------------------------------------
INSERT INTO products (id, product_code, name, category, description, base_price, stock, is_active)
VALUES
    (gen_random_uuid(), 'FLOUR001', 'Foxtail Flour', 'flour', 'Nutritious millet flour, gluten-free', 87.94, 400, true),
    (gen_random_uuid(), 'FLOUR002', 'Little Flour', 'flour', 'Fine millet flour for various recipes', 87.94, 400, true),
    (gen_random_uuid(), 'FLOUR003', 'Browntop Flour', 'flour', 'Rare millet flour, high nutrition', 87.94, 400, true),
    (gen_random_uuid(), 'FLOUR004', 'Barnyard Flour', 'flour', 'Low glycemic flour, diabetic-friendly', 87.94, 400, true),
    (gen_random_uuid(), 'FLOUR005', 'Ragi Flour', 'flour', 'Finger millet flour, calcium-rich', 56.44, 400, true),
    (gen_random_uuid(), 'FLOUR006', 'Natty Pearl Flour', 'flour', 'Pearl millet flour, natural goodness', 74.81, 400, true),
    (gen_random_uuid(), 'FLOUR007', 'Pearl Flour', 'flour', 'Fine pearl millet flour', 59.06, 400, true),
    (gen_random_uuid(), 'FLOUR008', 'Sorghum Flour', 'flour', 'Jowar flour, gluten-free', 61.69, 400, true),
    (gen_random_uuid(), 'FLOUR009', 'Proso Flour', 'flour', 'Proso millet flour, mild flavor', 72.19, 400, true),
    (gen_random_uuid(), 'FLOUR010', 'Millet Flour', 'flour', 'Economical millet flour', 59.06, 400, true);

-- ============================================================================
-- SECTION 2: PRODUCT VARIANTS DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 Create Variants for Millets, Rice, Flakes, Sugar, Laddus, Flour
-- Packaging: 1kg, 2kg, 5kg, 10kg
-- Discounts: 0% (1kg, 2kg), 2% (5kg), 3% (10kg)
-- Markup: 15% on base price
-- ----------------------------------------------------------------------------

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
WHERE p.category IN ('millets', 'rice', 'flakes', 'sugar', 'laddus', 'flour');

-- ----------------------------------------------------------------------------
-- 2.2 Create Variants for Honey
-- Packaging: 200g, 500g, 1kg
-- Discounts: 0% (200g, 500g), 2% (1kg)
-- Markup: 15% on base price
-- ----------------------------------------------------------------------------

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
        ('200g', 0.2, 0, 0.2),
        ('500g', 0.5, 0, 0.5),
        ('1kg', 1, 2, 1.0)
) AS v(size, multiplier, discount, weight)
WHERE p.category = 'honey';

-- ============================================================================
-- SECTION 3: SHIPPING RATES DATA
-- ============================================================================

INSERT INTO shipping_rates (id, state, city, base_rate, per_kg_rate, is_active)
VALUES
    -- Karnataka
    (gen_random_uuid(), 'Karnataka', 'Bangalore', 50.00, 10.00, true),
    (gen_random_uuid(), 'Karnataka', 'Mysore', 60.00, 12.00, true),
    (gen_random_uuid(), 'Karnataka', 'Mangalore', 70.00, 15.00, true),
    
    -- Tamil Nadu
    (gen_random_uuid(), 'Tamil Nadu', 'Chennai', 60.00, 12.00, true),
    (gen_random_uuid(), 'Tamil Nadu', 'Coimbatore', 65.00, 13.00, true),
    (gen_random_uuid(), 'Tamil Nadu', 'Madurai', 70.00, 14.00, true),
    
    -- Maharashtra
    (gen_random_uuid(), 'Maharashtra', 'Mumbai', 80.00, 15.00, true),
    (gen_random_uuid(), 'Maharashtra', 'Pune', 75.00, 14.00, true),
    
    -- Telangana
    (gen_random_uuid(), 'Telangana', 'Hyderabad', 65.00, 13.00, true),
    
    -- Andhra Pradesh
    (gen_random_uuid(), 'Andhra Pradesh', 'Vijayawada', 70.00, 14.00, true),
    (gen_random_uuid(), 'Andhra Pradesh', 'Visakhapatnam', 75.00, 15.00, true),
    
    -- Kerala
    (gen_random_uuid(), 'Kerala', 'Kochi', 70.00, 14.00, true),
    (gen_random_uuid(), 'Kerala', 'Trivandrum', 75.00, 15.00, true);

-- ============================================================================
-- SECTION 4: COMPLETE FLAKES CATEGORY TABLE
-- ============================================================================

/*
FLAKES CATEGORY - COMPLETE LIST (14 PRODUCTS)

┌────┬──────────────┬─────────────────────────────────┬──────────────┬────────────────────────────────────────────────┐
│ #  │ Product Code │ Product Name                    │ Base Price   │ Description                                    │
├────┼──────────────┼─────────────────────────────────┼──────────────┼────────────────────────────────────────────────┤
│ 1  │ FLAKES001    │ Foxtail Flakes                  │ ₹131.25      │ Crispy foxtail millet flakes                   │
│ 2  │ FLAKES002    │ Little Flakes                   │ ₹144.38      │ Nutritious little millet flakes                │
│ 3  │ FLAKES003    │ Kodo Flakes                     │ ₹133.88      │ Healthy kodo millet flakes                     │
│ 4  │ FLAKES004    │ Barnyard Flakes                 │ ₹147.00      │ Low-carb barnyard flakes                       │
│ 5  │ FLAKES005    │ Ragi Flakes                     │ ₹89.25       │ Calcium-rich finger millet flakes              │
│ 6  │ FLAKES006    │ Pearl Flakes                    │ ₹90.56       │ Crunchy pearl millet flakes                    │
│ 7  │ FLAKES007    │ Red Sorghum Flakes ⭐           │ ₹92.00       │ Rich in antioxidants                           │
│ 8  │ FLAKES008    │ White Sorghum Flakes ⭐         │ ₹90.00       │ Light and crispy                               │
│ 9  │ FLAKES009    │ Green Gram Flakes ⭐            │ ₹95.00       │ Protein-rich green gram                        │
│ 10 │ FLAKES010    │ Horse Gram Flakes ⭐            │ ₹98.00       │ High-protein horse gram                        │
│ 11 │ FLAKES011    │ Wheat Flakes ⭐                 │ ₹85.00       │ Wholesome wheat flakes                         │
│ 12 │ FLAKES012    │ Barley Flakes ⭐                │ ₹88.00       │ Fiber-rich barley flakes                       │
│ 13 │ FLAKES013    │ Karupukavini Rice Flakes ⭐     │ ₹120.00      │ Traditional black rice flakes                  │
│ 14 │ FLAKES014    │ Mapillai Sambha Rice Flakes ⭐  │ ₹125.00      │ Premium red rice flakes                        │
└────┴──────────────┴─────────────────────────────────┴──────────────┴────────────────────────────────────────────────┘

⭐ = New Products Added (8 new products)

PACKAGING OPTIONS FOR ALL FLAKES:
┌──────────────┬────────────┬──────────────────────────────────────────────────────────────┐
│ Package Size │ Discount   │ Price Calculation                                            │
├──────────────┼────────────┼──────────────────────────────────────────────────────────────┤
│ 1kg          │ 0%         │ Base Price × 1 × 1.15                                        │
│ 2kg          │ 0%         │ Base Price × 2 × 1.15                                        │
│ 5kg          │ 2%         │ Base Price × 5 × 1.15 × 0.98                                 │
│ 10kg         │ 3%         │ Base Price × 10 × 1.15 × 0.97                                │
└──────────────┴────────────┴──────────────────────────────────────────────────────────────┘

PRICING EXAMPLES:
┌─────────────────────────────────┬──────────┬──────────┬──────────┬───────────┬────────────┐
│ Product Name                    │ 1kg      │ 2kg      │ 5kg      │ 10kg      │ Stock/Size │
├─────────────────────────────────┼──────────┼──────────┼──────────┼───────────┼────────────┤
│ Foxtail Flakes                  │ ₹150.94  │ ₹301.88  │ ₹739.61  │ ₹1,467.84 │ 100        │
│ Little Flakes                   │ ₹166.04  │ ₹332.07  │ ₹813.82  │ ₹1,615.47 │ 100        │
│ Kodo Flakes                     │ ₹153.96  │ ₹307.92  │ ₹754.42  │ ₹1,497.14 │ 100        │
│ Barnyard Flakes                 │ ₹169.05  │ ₹338.10  │ ₹828.54  │ ₹1,644.66 │ 100        │
│ Ragi Flakes                     │ ₹102.64  │ ₹205.28  │ ₹503.16  │ ₹998.14   │ 100        │
│ Pearl Flakes                    │ ₹104.14  │ ₹208.29  │ ₹510.53  │ ₹1,013.29 │ 100        │
│ Red Sorghum Flakes ⭐           │ ₹105.80  │ ₹211.60  │ ₹518.42  │ ₹1,026.26 │ 100        │
│ White Sorghum Flakes ⭐         │ ₹103.50  │ ₹207.00  │ ₹507.15  │ ₹1,003.95 │ 100        │
│ Green Gram Flakes ⭐            │ ₹109.25  │ ₹218.50  │ ₹535.33  │ ₹1,059.73 │ 100        │
│ Horse Gram Flakes ⭐            │ ₹112.70  │ ₹225.40  │ ₹552.23  │ ₹1,093.19 │ 100        │
│ Wheat Flakes ⭐                 │ ₹97.75   │ ₹195.50  │ ₹478.98  │ ₹948.18   │ 100        │
│ Barley Flakes ⭐                │ ₹101.20  │ ₹202.40  │ ₹495.88  │ ₹981.64   │ 100        │
│ Karupukavini Rice Flakes ⭐     │ ₹138.00  │ ₹276.00  │ ₹676.20  │ ₹1,338.60 │ 100        │
│ Mapillai Sambha Rice Flakes ⭐  │ ₹143.75  │ ₹287.50  │ ₹704.38  │ ₹1,394.38 │ 100        │
└─────────────────────────────────┴──────────┴──────────┴──────────┴───────────┴────────────┘

CATEGORY BREAKDOWN:
├─ Millet-Based Flakes (6): Foxtail, Little, Kodo, Barnyard, Ragi, Pearl
├─ Sorghum Flakes (2): Red Sorghum ⭐, White Sorghum ⭐
├─ Gram Flakes (2): Green Gram ⭐, Horse Gram ⭐
├─ Grain Flakes (2): Wheat ⭐, Barley ⭐
└─ Traditional Rice Flakes (2): Karupukavini ⭐, Mapillai Sambha ⭐

TOTAL: 14 Products × 4 Variants = 56 Total Variants
*/

-- ============================================================================
-- SECTION 5: QUERY SCRIPTS FOR VERIFICATION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 View All Products by Category
-- ----------------------------------------------------------------------------

-- View all Flakes products
SELECT 
    product_code,
    name,
    category,
    base_price,
    stock,
    is_active
FROM products
WHERE category = 'flakes'
ORDER BY product_code;

-- View all products with variant count
SELECT 
    p.category,
    p.product_code,
    p.name,
    p.base_price,
    COUNT(pv.id) as variant_count,
    p.stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id, p.category, p.product_code, p.name, p.base_price, p.stock
ORDER BY p.category, p.product_code;

-- ----------------------------------------------------------------------------
-- 5.2 View All Product Variants with Pricing
-- ----------------------------------------------------------------------------

-- View all Flakes variants with pricing
SELECT 
    p.product_code,
    p.name as product_name,
    pv.packaging_size,
    pv.cost_price,
    pv.price as selling_price,
    pv.discount_percentage,
    pv.stock,
    pv.weight_kg
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.category = 'flakes'
ORDER BY p.product_code, 
    CASE pv.packaging_size
        WHEN '1kg' THEN 1
        WHEN '2kg' THEN 2
        WHEN '5kg' THEN 3
        WHEN '10kg' THEN 4
    END;

-- ----------------------------------------------------------------------------
-- 5.3 Product Summary by Category
-- ----------------------------------------------------------------------------

SELECT 
    category,
    COUNT(DISTINCT id) as total_products,
    COUNT(DISTINCT pv.id) as total_variants,
    MIN(base_price) as min_price,
    MAX(base_price) as max_price,
    SUM(stock) as total_stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- ----------------------------------------------------------------------------
-- 5.4 Complete Product Catalog
-- ----------------------------------------------------------------------------

SELECT 
    p.category,
    p.product_code,
    p.name,
    p.description,
    p.base_price,
    pv.packaging_size,
    pv.price as selling_price,
    pv.discount_percentage,
    pv.stock,
    pv.weight_kg
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.is_active = true
ORDER BY 
    p.category,
    p.product_code,
    CASE pv.packaging_size
        WHEN '200g' THEN 1
        WHEN '500g' THEN 2
        WHEN '1kg' THEN 3
        WHEN '2kg' THEN 4
        WHEN '5kg' THEN 5
        WHEN '10kg' THEN 6
    END;

-- ============================================================================
-- SECTION 6: USEFUL MANAGEMENT QUERIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6.1 Check Flakes Category Status
-- ----------------------------------------------------------------------------

-- Count Flakes products
SELECT COUNT(*) as total_flakes_products
FROM products
WHERE category = 'flakes' AND is_active = true;
-- Expected: 14

-- Count Flakes variants
SELECT COUNT(*) as total_flakes_variants
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE p.category = 'flakes' AND p.is_active = true;
-- Expected: 56

-- List new Flakes products
SELECT product_code, name, base_price
FROM products
WHERE product_code IN ('FLAKES007', 'FLAKES008', 'FLAKES009', 'FLAKES010', 
                       'FLAKES011', 'FLAKES012', 'FLAKES013', 'FLAKES014')
ORDER BY product_code;
-- Expected: 8 rows

-- ----------------------------------------------------------------------------
-- 6.2 Inventory Status
-- ----------------------------------------------------------------------------

-- Low stock alert (stock < 30)
SELECT 
    p.product_code,
    p.name,
    pv.packaging_size,
    pv.stock
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE pv.stock < 30
ORDER BY pv.stock ASC, p.product_code;

-- Out of stock items
SELECT 
    p.product_code,
    p.name,
    pv.packaging_size,
    pv.stock
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE pv.stock = 0
ORDER BY p.product_code;

-- ----------------------------------------------------------------------------
-- 6.3 Pricing Analysis
-- ----------------------------------------------------------------------------

-- Price range by category
SELECT 
    category,
    MIN(base_price) as min_base_price,
    MAX(base_price) as max_base_price,
    AVG(base_price) as avg_base_price,
    COUNT(*) as product_count
FROM products
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- Variant pricing summary
SELECT 
    p.category,
    pv.packaging_size,
    MIN(pv.price) as min_price,
    MAX(pv.price) as max_price,
    AVG(pv.price) as avg_price,
    COUNT(*) as variant_count
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE p.is_active = true
GROUP BY p.category, pv.packaging_size
ORDER BY p.category, 
    CASE pv.packaging_size
        WHEN '200g' THEN 1
        WHEN '500g' THEN 2
        WHEN '1kg' THEN 3
        WHEN '2kg' THEN 4
        WHEN '5kg' THEN 5
        WHEN '10kg' THEN 6
    END;

-- ----------------------------------------------------------------------------
-- 6.4 Order Statistics
-- ----------------------------------------------------------------------------

-- Total orders by status
SELECT 
    status,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue
FROM orders
GROUP BY status
ORDER BY status;

-- Orders by type
SELECT 
    order_type,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue
FROM orders
GROUP BY order_type;

-- Recent orders (last 30 days)
SELECT 
    id,
    customer_name,
    order_type,
    status,
    total_amount,
    created_at
FROM orders
WHERE created_at >= now() - interval '30 days'
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- SECTION 7: ADMIN HELPER QUERIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1 Product Management
-- ----------------------------------------------------------------------------

-- Add new product (template)
/*
INSERT INTO products (id, product_code, name, category, description, base_price, stock, is_active)
VALUES (
    gen_random_uuid(),
    'CATEGORY###',
    'Product Name',
    'category_name',
    'Product description',
    100.00,
    400,
    true
);
*/

-- Add variants for a product (template)
/*
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
WHERE p.product_code = 'PRODUCT_CODE';
*/

-- Update product price
/*
UPDATE products
SET base_price = 150.00,
    updated_at = now()
WHERE product_code = 'PRODUCT_CODE';

-- Then update variant prices
UPDATE product_variants pv
SET price = ROUND(p.base_price * 
    CASE pv.packaging_size
        WHEN '1kg' THEN 1
        WHEN '2kg' THEN 2
        WHEN '5kg' THEN 5
        WHEN '10kg' THEN 10
        WHEN '200g' THEN 0.2
        WHEN '500g' THEN 0.5
    END * 1.15 * (1 - pv.discount_percentage / 100.0), 2),
    cost_price = ROUND(p.base_price * 
    CASE pv.packaging_size
        WHEN '1kg' THEN 1
        WHEN '2kg' THEN 2
        WHEN '5kg' THEN 5
        WHEN '10kg' THEN 10
        WHEN '200g' THEN 0.2
        WHEN '500g' THEN 0.5
    END, 2)
FROM products p
WHERE pv.product_id = p.id
  AND p.product_code = 'PRODUCT_CODE';
*/

-- Update stock quantity
/*
UPDATE product_variants
SET stock = stock + 50
WHERE product_id = (SELECT id FROM products WHERE product_code = 'PRODUCT_CODE')
  AND packaging_size = '1kg';
*/

-- ----------------------------------------------------------------------------
-- 7.2 Order Management
-- ----------------------------------------------------------------------------

-- Get order details with items
/*
SELECT 
    o.id,
    o.customer_name,
    o.order_type,
    o.status,
    o.subtotal,
    o.gst_amount,
    o.shipping_cost,
    o.total_amount,
    o.created_at,
    json_agg(
        json_build_object(
            'product_name', oi.product_name,
            'packaging_size', oi.packaging_size,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal
        )
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 'ORDER_ID'
GROUP BY o.id;
*/

-- Update order status
/*
UPDATE orders
SET status = 'completed',
    payment_status = 'completed',
    completed_at = now(),
    updated_at = now()
WHERE id = 'ORDER_ID';
*/

-- ----------------------------------------------------------------------------
-- 7.3 Inventory Management
-- ----------------------------------------------------------------------------

-- Bulk update stock
/*
UPDATE product_variants pv
SET stock = stock + 100
FROM products p
WHERE pv.product_id = p.id
  AND p.category = 'flakes';
*/

-- Reset stock to default
/*
UPDATE product_variants
SET stock = 100
WHERE product_id IN (
    SELECT id FROM products WHERE category = 'flakes'
);
*/

-- ============================================================================
-- END OF DATA INSERTION SCRIPT
-- ============================================================================
