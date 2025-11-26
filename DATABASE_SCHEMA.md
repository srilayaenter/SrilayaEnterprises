# Srilaya Enterprises - Database Schema Documentation

## Overview

This document provides a complete reference for the database schema used in the Srilaya Enterprises Organic Store application.

**Database Type:** PostgreSQL (via Supabase)  
**Security:** Row Level Security (RLS) enabled on all tables  
**Authentication:** Supabase Auth with email/password

---

## Entity Relationship Diagram (Text Format)

```

   auth.users    │ (Supabase Auth)
  (Built-in)     │

         │
         │ 1:1
         │
git config --global miaoda user.name
    profiles     │
  - id (PK, FK)  │
  - email        │
  - nickname     │
  - role         │
  - created_at   │

         │
         │ 1:N
         │
git config --global miaoda user.name
     orders      │
  - id (PK)      │
  - user_id (FK) │
  - items        │
  - total_amount │
  - status       │
  - created_at   │



    products     │
  - id (PK)      │
  - product_code │
  - name         │
  - category     │
  - description  │
  - base_price   │
  - image_url    │
  - created_at   │

         │
         │ 1:N
         │
git config --global miaoda user.name
 product_variants    │
  - id (PK)          │
  - product_id (FK)  │
  - packaging_size   │
  - price            │
  - stock            │
  - created_at       │

```

---

## Enums

### 1. user_role
Defines user access levels in the system.

```sql
CREATE TYPE user_role AS ENUM ('user', 'admin');
```

**Values:**
- `user` - Regular customer with basic access
- `admin` - Administrator with full system access

**Usage:** `profiles.role` column

---

### 2. product_category
Defines product classification categories.

```sql
CREATE TYPE product_category AS ENUM (
  'millets',
  'rice',
  'flakes',
  'sugar',
  'honey',
  'laddus'
);
```

**Values:**
- `millets` - Millet products (11 products)
- `rice` - Rice varieties (6 products)
- `flakes` - Flakes and flour products (17 products)
- `sugar` - Sugar alternatives (not currently used)
- `honey` - Honey products (6 products)
- `laddus` - Laddu products (not currently used)

**Usage:** `products.category` column

---

### 3. order_status
Defines order lifecycle states.

```sql
CREATE TYPE order_status AS ENUM (
  'pending',
  'completed',
  'cancelled'
);
```

**Values:**
- `pending` - Order created, payment not confirmed
- `completed` - Payment successful, order confirmed
- `cancelled` - Order cancelled by user or system

**Usage:** `orders.status` column

---

## Tables

### 1. profiles

Stores user profile information and roles.

**Purpose:** Extends Supabase Auth users with additional profile data

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE,
  email text UNIQUE,
  nickname text,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, FOREIGN KEY | References auth.users(id) |
| phone | text | UNIQUE, NULLABLE | User phone number |
| email | text | UNIQUE, NULLABLE | User email address |
| nickname | text | NULLABLE | Display name for user |
| role | user_role | NOT NULL, DEFAULT 'user' | User access level |
| created_at | timestamptz | DEFAULT now() | Account creation timestamp |

**Indexes:**
- Primary key index on `id`
- Unique index on `phone`
- Unique index on `email`

**Row Level Security (RLS):**

```sql
-- Admins have full access to all profiles
CREATE POLICY "Admins have full access" ON profiles
  FOR ALL TO authenticated 
  USING (is_admin(auth.uid()));

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile without changing role" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (role IS NOT DISTINCT FROM old.role);
```

**Triggers:**

```sql
-- Automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- First user becomes admin automatically
-- Implemented in handle_new_user() function
```

**Sample Data:**
```sql
-- First registered user automatically gets admin role
-- Subsequent users get 'user' role by default
```

---

### 2. products

Stores product catalog information.

**Purpose:** Main product catalog with base information

```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code text UNIQUE,
  name text NOT NULL,
  category product_category NOT NULL,
  description text,
  base_price numeric(10,2) NOT NULL CHECK (base_price > 0),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique product identifier |
| product_code | text | UNIQUE, NULLABLE | Product code (RICE001, etc.) |
| name | text | NOT NULL | Product name |
| category | product_category | NOT NULL | Product category |
| description | text | NULLABLE | Product description |
| base_price | numeric(10,2) | NOT NULL, > 0 | Base price per kg/unit in ₹ |
| image_url | text | NULLABLE | Product image URL |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
- Primary key index on `id`
- Unique index on `product_code`
- Index on `category` for filtering

**Row Level Security (RLS):**

```sql
-- Anyone can view products (public access)
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT 
  USING (true);

-- Only admins can insert products
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can update products
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));

-- Only admins can delete products
CREATE POLICY "Admins can delete products" ON products
  FOR DELETE TO authenticated
  USING (is_admin(auth.uid()));
```

**Triggers:**

```sql
-- Update updated_at timestamp on modification
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**Current Data:**
- 40 products total
- 6 Rice products
- 10 Flour products (categorized as flakes)
- 7 Flakes products
- 11 Millets products
- 6 Honey products

---

### 3. product_variants

Stores different packaging sizes and prices for products.

**Purpose:** Multiple packaging options for each product

```sql
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  packaging_size text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price > 0),
  stock integer DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz DEFAULT now()
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique variant identifier |
| product_id | uuid | NOT NULL, FOREIGN KEY | References products(id) |
| packaging_size | text | NOT NULL | Size (1kg, 2kg, 5kg, etc.) |
| price | numeric(10,2) | NOT NULL, > 0 | Price for this size in ₹ |
| stock | integer | DEFAULT 0, >= 0 | Available stock quantity |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

**Indexes:**
- Primary key index on `id`
- Foreign key index on `product_id`
- Composite index on `(product_id, packaging_size)` for queries

**Row Level Security (RLS):**

```sql
-- Anyone can view product variants
CREATE POLICY "Anyone can view variants" ON product_variants
  FOR SELECT 
  USING (true);

-- Only admins can manage variants
CREATE POLICY "Admins can manage variants" ON product_variants
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));
```

**Packaging Options:**

**Standard Products (Rice, Flour, Flakes, Millets):**
- 1kg - base price × 1
- 2kg - base price × 2
- 5kg - base price × 5
- 10kg - base price × 10

**Honey Products:**
- 250g - base price × 0.25
- 500g - base price × 0.5
- 1kg - base price × 1

**Current Data:**
- 154 variants total
- 4 variants per standard product
- 3 variants per honey product

---

### 4. orders

Stores customer orders and payment information.

**Purpose:** Track customer purchases and order status

```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  items jsonb NOT NULL,
  total_amount numeric(10,2) NOT NULL CHECK (total_amount > 0),
  currency text DEFAULT 'inr',
  status order_status DEFAULT 'pending'::order_status NOT NULL,
  shipping_address text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique order identifier |
| user_id | uuid | FOREIGN KEY, NULLABLE | References profiles(id) |
| items | jsonb | NOT NULL | Order items array |
| total_amount | numeric(10,2) | NOT NULL, > 0 | Total order amount in ₹ |
| currency | text | DEFAULT 'inr' | Currency code (INR) |
| status | order_status | NOT NULL, DEFAULT 'pending' | Order status |
| shipping_address | text | NULLABLE | Delivery address |
| stripe_session_id | text | NULLABLE | Stripe checkout session ID |
| stripe_payment_intent_id | text | NULLABLE | Stripe payment intent ID |
| created_at | timestamptz | DEFAULT now() | Order creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Items JSONB Structure:**
```json
[
  {
    "name": "Product Name",
    "price": 94.50,
    "quantity": 2,
    "image_url": "https://...",
    "packaging_size": "1kg",
    "product_id": "uuid",
    "variant_id": "uuid"
  }
]
```

**Indexes:**
- Primary key index on `id`
- Foreign key index on `user_id`
- Index on `status` for filtering
- Index on `created_at` for sorting

**Row Level Security (RLS):**

```sql
-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can update all orders
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));
```

**Triggers:**

```sql
-- Update updated_at timestamp on modification
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## Helper Functions

### 1. is_admin()

Checks if a user has admin role.

```sql
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;
```

**Purpose:** Used in RLS policies to check admin access  
**Security:** SECURITY DEFINER allows checking other users' roles  
**Returns:** `true` if user is admin, `false` otherwise

---

### 2. handle_new_user()

Automatically creates profile when user signs up.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count integer;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Insert new profile
  INSERT INTO profiles (id, email, nickname, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
  );
  
  RETURN NEW;
END;
$$;
```

**Purpose:** Auto-create profile and assign admin to first user  
**Trigger:** Fires after INSERT on auth.users  
**Logic:** First user gets 'admin' role, others get 'user' role

---

### 3. update_updated_at()

Updates the updated_at timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

**Purpose:** Automatically update timestamp on row modification  
**Trigger:** Fires before UPDATE on tables with updated_at column

---

## Security Policies Summary

### Public Access (No Authentication Required)
- ✅ View all products
- ✅ View all product variants

### Authenticated Users
- ✅ View own profile
- ✅ Update own profile (except role)
- ✅ View own orders
- ✅ Create own orders

### Admin Users
- ✅ Full access to all profiles
- ✅ Full access to all products
- ✅ Full access to all product variants
- ✅ Full access to all orders
- ✅ Manage product catalog
- ✅ Manage customer accounts

---

## Data Integrity Constraints

### Check Constraints
- `products.base_price > 0` - Prices must be positive
- `product_variants.price > 0` - Variant prices must be positive
- `product_variants.stock >= 0` - Stock cannot be negative
- `orders.total_amount > 0` - Order total must be positive

### Foreign Key Constraints
- `profiles.id` → `auth.users.id` (CASCADE DELETE)
- `product_variants.product_id` → `products.id` (CASCADE DELETE)
- `orders.user_id` → `profiles.id` (SET NULL on delete)

### Unique Constraints
- `profiles.phone` - Unique phone numbers
- `profiles.email` - Unique email addresses
- `products.product_code` - Unique product codes

---

## Database Statistics

### Current Data Volume

| Table | Records | Notes |
|-------|---------|-------|
| profiles | Variable | Grows with user registrations |
| products | 40 | Fixed product catalog |
| product_variants | 154 | 3-4 variants per product |
| orders | Variable | Grows with customer orders |

### Storage Estimates

- **Products + Variants:** ~50 KB
- **Per User Profile:** ~1 KB
- **Per Order:** ~2-5 KB (depending on items)

---

## Backup and Maintenance

### Recommended Practices

1. **Regular Backups**
   - Supabase provides automatic daily backups
   - Point-in-time recovery available

2. **Index Maintenance**
   - PostgreSQL auto-vacuums regularly
   - Indexes automatically maintained

3. **Data Cleanup**
   - Consider archiving old orders (> 1 year)
   - Monitor storage usage

4. **Performance Monitoring**
   - Monitor slow queries
   - Check index usage
   - Review RLS policy performance

---

## Migration History

### Migration 1: Initial Schema
- Created enums (user_role, product_category, order_status)
- Created profiles table
- Created products table
- Created product_variants table
- Created orders table
- Set up RLS policies
- Created helper functions
- Created triggers

### Migration 2: Sample Data
- Inserted 17 sample products (replaced)

### Migration 3: Real Product Data
- Deleted sample data
- Added product_code column to products
- Inserted 40 real products from inventory
- Created 154 product variants
- Updated pricing to INR

---

## API Access Patterns

### Common Queries

**Get all products with variants:**
```sql
SELECT p.*, 
       json_agg(pv.*) as variants
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id;
```

**Get user orders:**
```sql
SELECT * FROM orders
WHERE user_id = $1
ORDER BY created_at DESC;
```

**Check product stock:**
```sql
SELECT p.name, pv.packaging_size, pv.stock
FROM products p
JOIN product_variants pv ON p.id = pv.product_id
WHERE pv.stock < 20;
```

**Get products by category:**
```sql
SELECT * FROM products
WHERE category = $1
ORDER BY name;
```

---

## Schema Version

**Current Version:** 1.3  
**Last Updated:** 2025-11-26  
**Database:** PostgreSQL 15 (Supabase)  
**Status:** Production Ready ✅

---

## Notes

1. **Currency:** All prices stored in Indian Rupees (₹)
2. **Timestamps:** All timestamps in UTC (timestamptz)
3. **UUIDs:** Using gen_random_uuid() for primary keys
4. **JSONB:** Orders.items stored as JSONB for flexibility
5. **RLS:** Enabled on all tables for security
6. **Cascading:** Product deletion cascades to variants
7. **Soft Delete:** User deletion sets orders.user_id to NULL

---

**Schema Status: ✅ COMPLETE AND OPERATIONAL**
