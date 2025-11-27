# Srilaya Enterprises - Complete Admin Management Guide

## 📋 Table of Contents
1. [User Management](#user-management)
2. [Customer Management](#customer-management)
3. [Product Management](#product-management)
4. [Stock/Inventory Management](#stock-inventory-management)
5. [Shipping Cost Configuration](#shipping-cost-configuration)
6. [Order & Invoice Management](#order--invoice-management)

---

## 1. User Management

### How to Add a New User/Admin

#### Method 1: Through Registration (Recommended for Customers)
1. Navigate to the website
2. Click "Login" in the header
3. Click "Sign up" link
4. Fill in the registration form:
   - Email address
   - Password (minimum 6 characters)
   - Nickname (display name)
5. Click "Create Account"
6. User is automatically logged in

**Note:** The first user to register automatically becomes an admin. Subsequent users are regular customers.

#### Method 2: Direct Database Access (For Additional Admins)

**Using Supabase Dashboard:**

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Click "Create User"
5. Go to Table Editor → profiles table
6. Find the new user's row
7. Change `role` from 'user' to 'admin'
8. Save changes

**Using SQL:**
```sql
-- After user registers, promote to admin
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email = 'newadmin@example.com';
```

### User Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access: manage products, view all orders, manage customers, update inventory |
| **user** | Customer access: browse products, place orders, view own orders |

### View All Users

1. Log in as admin
2. Navigate to `/admin` (Admin Dashboard)
3. Click "Customers" tab
4. View list of all registered users with:
   - Email
   - Nickname
   - Role
   - Registration date

---

## 2. Customer Management

### View Customer Information

**Admin Dashboard → Customers Tab**

Displays:
- User ID
- Email address
- Nickname
- Role (user/admin)
- Registration date (created_at)

### View Customer Orders

**Admin Dashboard → Orders Tab**

Filter orders by:
- Customer ID (user_id)
- Order status
- Date range

### Customer Data Includes:
- Profile information
- Order history
- Total spending
- Shipping addresses

---

## 3. Product Management

### How to Add a New Product

#### Method 1: Using Supabase Dashboard

1. Go to Supabase Dashboard → Table Editor
2. Select `products` table
3. Click "Insert" → "Insert row"
4. Fill in product details:

```
name: "Product Name"
category: Select from dropdown (millets/rice/flour/flakes/honey/laddus)
description: "Product description"
base_price: 100.00 (price per kg in ₹)
product_code: "PROD001" (unique code)
image_url: "https://..." (product image URL)
```

5. Click "Save"
6. Note the product ID for adding variants

#### Method 2: Using SQL

```sql
-- Insert new product
INSERT INTO products (
  name, 
  category, 
  description, 
  base_price, 
  product_code,
  image_url
) VALUES (
  'Organic Brown Rice',
  'rice'::product_category,
  'Premium quality organic brown rice',
  120.00,
  'RICE007',
  'https://example.com/brown-rice.jpg'
);
```

### Add Product Variants (Packaging Sizes)

After adding a product, add its variants:

```sql
-- Get the product ID first
SELECT id FROM products WHERE product_code = 'RICE007';

-- Insert variants for different packaging sizes
INSERT INTO product_variants (
  product_id,
  packaging_size,
  price,
  stock,
  weight_kg
) VALUES
  ('product-uuid-here', '1kg', 120.00, 100, 1.0),
  ('product-uuid-here', '2kg', 240.00, 50, 2.0),
  ('product-uuid-here', '5kg', 600.00, 30, 5.0),
  ('product-uuid-here', '10kg', 1200.00, 20, 10.0);
```

### Product Categories

Available categories:
- `millets` - Millet products
- `rice` - Rice varieties
- `flour` - Flour products
- `flakes` - Flakes products
- `sugar` - Sugar alternatives
- `honey` - Honey products
- `laddus` - Laddu products

### Edit Existing Product

**Using Supabase Dashboard:**
1. Go to Table Editor → products
2. Find the product row
3. Click on any cell to edit
4. Update values
5. Press Enter or click outside to save

**Using SQL:**
```sql
-- Update product details
UPDATE products
SET 
  name = 'Updated Product Name',
  base_price = 150.00,
  description = 'Updated description'
WHERE product_code = 'RICE007';
```

### Delete Product

**⚠️ Warning:** Deleting a product will also delete all its variants (CASCADE).

```sql
-- Delete product and all variants
DELETE FROM products 
WHERE product_code = 'RICE007';
```

---

## 4. Stock/Inventory Management

### View Current Stock Levels

**Using Supabase Dashboard:**
1. Go to Table Editor → product_variants
2. View `stock` column for each variant
3. Sort by stock to find low inventory

**Using SQL:**
```sql
-- View all products with stock levels
SELECT 
  p.name,
  p.category,
  pv.packaging_size,
  pv.stock,
  pv.price
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
ORDER BY pv.stock ASC;

-- Find low stock items (less than 20 units)
SELECT 
  p.name,
  pv.packaging_size,
  pv.stock
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE pv.stock < 20
ORDER BY pv.stock ASC;
```

### Update Stock for Single Product

**Using Supabase Dashboard:**
1. Go to Table Editor → product_variants
2. Find the variant row
3. Click on `stock` cell
4. Enter new stock quantity
5. Press Enter to save

**Using SQL:**
```sql
-- Update stock for specific variant
UPDATE product_variants
SET stock = 150
WHERE id = 'variant-uuid-here';

-- Update stock by product name and size
UPDATE product_variants pv
SET stock = 200
FROM products p
WHERE pv.product_id = p.id
  AND p.name = 'Ragi Flour'
  AND pv.packaging_size = '1kg';
```

### Bulk Stock Update

```sql
-- Increase stock for all 1kg variants by 50 units
UPDATE product_variants
SET stock = stock + 50
WHERE packaging_size = '1kg';

-- Set minimum stock level for all products
UPDATE product_variants
SET stock = GREATEST(stock, 20);

-- Update stock for entire category
UPDATE product_variants pv
SET stock = stock + 100
FROM products p
WHERE pv.product_id = p.id
  AND p.category = 'rice'::product_category;
```

### Stock Adjustment After Order

Stock is automatically managed, but for manual adjustments:

```sql
-- Reduce stock after manual order
UPDATE product_variants
SET stock = stock - 5
WHERE id = 'variant-uuid-here'
  AND stock >= 5;  -- Prevent negative stock
```

### Generate Stock Report

```sql
-- Complete inventory report
SELECT 
  p.category,
  p.name,
  p.product_code,
  pv.packaging_size,
  pv.stock,
  pv.price,
  (pv.stock * pv.price) as inventory_value
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
ORDER BY p.category, p.name, pv.packaging_size;

-- Category-wise stock summary
SELECT 
  p.category,
  COUNT(DISTINCT p.id) as product_count,
  SUM(pv.stock) as total_units,
  SUM(pv.stock * pv.price) as total_value
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.category
ORDER BY p.category;
```

---

## 5. Shipping Cost Configuration

### How Shipping Cost is Calculated

Shipping cost is calculated based on **total order weight** using weight-based rates.

**Formula:**
```
Shipping Cost = Base Cost + (Total Weight × Rate per KG)
```

### View Current Shipping Rates

```sql
SELECT 
  min_weight_kg,
  max_weight_kg,
  base_cost,
  rate_per_kg,
  is_active
FROM shipping_rates
WHERE is_active = true
ORDER BY min_weight_kg;
```

### Default Shipping Rates (India)

| Weight Range | Base Cost | Rate per KG | Example (5kg order) |
|--------------|-----------|-------------|---------------------|
| 0 - 1 kg | ₹40 | ₹50/kg | ₹40 + (0.5 × ₹50) = ₹65 |
| 1 - 5 kg | ₹50 | ₹40/kg | ₹50 + (3 × ₹40) = ₹170 |
| 5 - 10 kg | ₹60 | ₹35/kg | ₹60 + (7 × ₹35) = ₹305 |
| 10 - 20 kg | ₹80 | ₹30/kg | ₹80 + (15 × ₹30) = ₹530 |
| 20+ kg | ₹100 | ₹25/kg | ₹100 + (25 × ₹25) = ₹725 |

### Update Shipping Rates

```sql
-- Update rate for specific weight range
UPDATE shipping_rates
SET 
  base_cost = 60,
  rate_per_kg = 45
WHERE min_weight_kg = 1 AND max_weight_kg = 5;

-- Add new shipping rate tier
INSERT INTO shipping_rates (
  min_weight_kg,
  max_weight_kg,
  base_cost,
  rate_per_kg
) VALUES (
  50,
  100,
  150,
  20
);
```

### Calculate Shipping for Order

```sql
-- Calculate shipping cost for specific weight
SELECT calculate_shipping_cost(7.5) as shipping_cost;
-- Returns: ₹322.50 (₹60 base + 7.5kg × ₹35)
```

### Update Product Weights

```sql
-- Update weight for specific variant
UPDATE product_variants
SET weight_kg = 2.5
WHERE id = 'variant-uuid-here';

-- Bulk update weights based on packaging size
UPDATE product_variants
SET weight_kg = CASE 
  WHEN packaging_size = '250g' THEN 0.25
  WHEN packaging_size = '500g' THEN 0.5
  WHEN packaging_size = '1kg' THEN 1.0
  WHEN packaging_size = '2kg' THEN 2.0
  WHEN packaging_size = '5kg' THEN 5.0
  WHEN packaging_size = '10kg' THEN 10.0
  ELSE 1.0
END;
```

---

## 6. Order & Invoice Management

### View All Orders

**Admin Dashboard → Orders Tab**

Displays:
- Order ID
- Customer ID
- Order date
- Total amount (including shipping)
- Shipping cost
- Order status
- Items ordered

### View Order Details with Shipping

```sql
-- Complete order details with shipping
SELECT 
  o.id,
  o.created_at,
  o.total_amount,
  o.shipping_cost,
  (o.total_amount + o.shipping_cost) as grand_total,
  o.status,
  o.items,
  p.email as customer_email,
  p.nickname as customer_name
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC;
```

### Calculate Order Weight and Shipping

```sql
-- Function to calculate total weight from order items
CREATE OR REPLACE FUNCTION get_order_weight(order_items jsonb)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  total_weight numeric := 0;
  item jsonb;
  variant_weight numeric;
  item_quantity integer;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(order_items)
  LOOP
    -- Get variant weight
    SELECT weight_kg INTO variant_weight
    FROM product_variants
    WHERE id = (item->>'variant_id')::uuid;
    
    -- Get item quantity
    item_quantity := (item->>'quantity')::integer;
    
    -- Add to total weight
    total_weight := total_weight + (variant_weight * item_quantity);
  END LOOP;
  
  RETURN total_weight;
END;
$$;

-- Use the function
SELECT 
  id,
  get_order_weight(items) as total_weight_kg,
  calculate_shipping_cost(get_order_weight(items)) as calculated_shipping
FROM orders
WHERE id = 'order-uuid-here';
```

### Update Order Shipping Cost

```sql
-- Recalculate and update shipping for existing order
UPDATE orders
SET shipping_cost = calculate_shipping_cost(get_order_weight(items))
WHERE id = 'order-uuid-here';

-- Bulk update all pending orders
UPDATE orders
SET shipping_cost = calculate_shipping_cost(get_order_weight(items))
WHERE status = 'pending'::order_status;
```

### Generate Invoice with Shipping

```sql
-- Complete invoice query
SELECT 
  o.id as order_id,
  o.created_at as order_date,
  p.email as customer_email,
  p.nickname as customer_name,
  o.shipping_address,
  o.items,
  o.total_amount as subtotal,
  o.shipping_cost,
  (o.total_amount + o.shipping_cost) as grand_total,
  o.currency,
  o.status
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
WHERE o.id = 'order-uuid-here';
```

### Order Status Management

```sql
-- Update order status
UPDATE orders
SET status = 'completed'::order_status
WHERE id = 'order-uuid-here';

-- Cancel order
UPDATE orders
SET status = 'cancelled'::order_status
WHERE id = 'order-uuid-here';

-- View orders by status
SELECT 
  status,
  COUNT(*) as order_count,
  SUM(total_amount + shipping_cost) as total_revenue
FROM orders
GROUP BY status;
```

---

## 📊 Quick Reference Commands

### Add New Product (Complete Flow)

```sql
-- 1. Insert product
INSERT INTO products (name, category, description, base_price, product_code)
VALUES ('New Product', 'rice'::product_category, 'Description', 100.00, 'PROD999')
RETURNING id;

-- 2. Insert variants (use returned ID)
INSERT INTO product_variants (product_id, packaging_size, price, stock, weight_kg)
VALUES 
  ('returned-id-here', '1kg', 100.00, 100, 1.0),
  ('returned-id-here', '2kg', 200.00, 50, 2.0),
  ('returned-id-here', '5kg', 500.00, 30, 5.0);
```

### Update Stock

```sql
-- Single product
UPDATE product_variants SET stock = 200 WHERE id = 'variant-id';

-- By product name and size
UPDATE product_variants pv
SET stock = 150
FROM products p
WHERE pv.product_id = p.id
  AND p.name = 'Product Name'
  AND pv.packaging_size = '1kg';
```

### View Low Stock

```sql
SELECT p.name, pv.packaging_size, pv.stock
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE pv.stock < 20
ORDER BY pv.stock;
```

### Calculate Shipping

```sql
-- For specific weight
SELECT calculate_shipping_cost(5.5);

-- For order
SELECT calculate_shipping_cost(get_order_weight(items))
FROM orders WHERE id = 'order-id';
```

---

## 🔧 Common Tasks

### Task 1: Add 10 New Products

1. Prepare product data (name, category, price, code)
2. Use bulk INSERT for products
3. Use bulk INSERT for variants
4. Verify with SELECT query

### Task 2: Update All Stock Levels

1. Export current stock to CSV
2. Update CSV with new quantities
3. Use UPDATE statements or import
4. Verify changes

### Task 3: Change Shipping Rates

1. Review current rates
2. Update shipping_rates table
3. Test with sample orders
4. Apply to new orders

### Task 4: Generate Monthly Report

```sql
-- Monthly sales report with shipping
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_orders,
  SUM(total_amount) as product_revenue,
  SUM(shipping_cost) as shipping_revenue,
  SUM(total_amount + shipping_cost) as total_revenue
FROM orders
WHERE status = 'completed'::order_status
GROUP BY month
ORDER BY month DESC;
```

---

## 🚨 Important Notes

1. **Stock Management**: Always check stock before manual updates to avoid negative values
2. **Shipping Costs**: Automatically calculated on checkout based on cart weight
3. **Product Codes**: Must be unique across all products
4. **Admin Access**: First registered user is admin; promote others via database
5. **Backup**: Always backup database before bulk operations
6. **Testing**: Test shipping calculations with sample orders before going live

---

## 📞 Support

For technical issues or questions:
- Check database logs in Supabase Dashboard
- Review migration history
- Verify RLS policies are active
- Test with sample data first

---

**Last Updated:** 2025-11-27
**Version:** 1.0
**Status:** Production Ready ✅
