# Quick Admin Reference Card

## 🚀 Daily Operations Cheat Sheet

### Add New User (Make Admin)
```sql
-- Promote existing user to admin
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email = 'user@example.com';
```

### Add New Product
```sql
-- Step 1: Add product
INSERT INTO products (name, category, description, base_price, product_code)
VALUES ('Product Name', 'rice'::product_category, 'Description', 100.00, 'CODE001')
RETURNING id;

-- Step 2: Add variants (replace UUID with returned ID)
INSERT INTO product_variants (product_id, packaging_size, price, stock, weight_kg) VALUES
('UUID-HERE', '1kg', 100.00, 100, 1.0),
('UUID-HERE', '2kg', 200.00, 50, 2.0),
('UUID-HERE', '5kg', 500.00, 30, 5.0);
```

### Update Stock
```sql
-- Single product by name and size
UPDATE product_variants pv
SET stock = 200
FROM products p
WHERE pv.product_id = p.id
  AND p.name = 'Ragi Flour'
  AND pv.packaging_size = '1kg';

-- Bulk update for category
UPDATE product_variants pv
SET stock = stock + 50
FROM products p
WHERE pv.product_id = p.id
  AND p.category = 'rice'::product_category;
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

-- Current shipping rates
SELECT min_weight_kg, max_weight_kg, base_cost, rate_per_kg
FROM shipping_rates
WHERE is_active = true
ORDER BY min_weight_kg;
```

### Update Shipping Rates
```sql
-- Modify existing rate
UPDATE shipping_rates
SET base_cost = 60, rate_per_kg = 45
WHERE min_weight_kg = 1 AND max_weight_kg = 5;
```

### View Orders with Shipping
```sql
SELECT 
  o.id,
  o.created_at,
  p.email,
  o.total_amount as subtotal,
  o.shipping_cost,
  (o.total_amount + o.shipping_cost) as grand_total,
  o.status
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC
LIMIT 10;
```

### Update Order Status
```sql
-- Complete order
UPDATE orders
SET status = 'completed'::order_status
WHERE id = 'order-uuid';

-- Cancel order
UPDATE orders
SET status = 'cancelled'::order_status
WHERE id = 'order-uuid';
```

### Inventory Report
```sql
-- Stock value by category
SELECT 
  p.category,
  COUNT(DISTINCT p.id) as products,
  SUM(pv.stock) as total_units,
  SUM(pv.stock * pv.price) as inventory_value
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.category;
```

### Sales Report
```sql
-- Monthly revenue with shipping
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as orders,
  SUM(total_amount) as product_sales,
  SUM(shipping_cost) as shipping_revenue,
  SUM(total_amount + shipping_cost) as total_revenue
FROM orders
WHERE status = 'completed'::order_status
GROUP BY month
ORDER BY month DESC;
```

---

## 📊 Shipping Rate Table

| Weight | Base Cost | Rate/kg | Example (3kg) |
|--------|-----------|---------|---------------|
| 0-1kg | ₹40 | ₹50/kg | ₹40 + (0.5×₹50) = ₹65 |
| 1-5kg | ₹50 | ₹40/kg | ₹50 + (3×₹40) = ₹170 |
| 5-10kg | ₹60 | ₹35/kg | ₹60 + (7×₹35) = ₹305 |
| 10-20kg | ₹80 | ₹30/kg | ₹80 + (15×₹30) = ₹530 |
| 20+kg | ₹100 | ₹25/kg | ₹100 + (25×₹25) = ₹725 |

---

## 🔑 Access Points

- **Admin Dashboard**: `/admin`
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Database**: Table Editor → Select table
- **Auth**: Authentication → Users

---

## ⚠️ Important Reminders

1. **Always backup** before bulk operations
2. **Test shipping** calculations with sample orders
3. **Check stock** before manual updates
4. **Product codes** must be unique
5. **First user** is automatically admin

---

**Quick Help**: See ADMIN_MANAGEMENT_GUIDE.md for detailed instructions
