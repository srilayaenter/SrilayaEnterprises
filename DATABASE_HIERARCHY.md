# Database Schema Hierarchy - Srilaya Enterprises Organic Store

**Complete Database Structure with Relationships**

---

## 📊 Database Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SRILAYA ENTERPRISES DATABASE                         │
│                         PostgreSQL (Supabase)                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
        │   FOUNDATION     │ │   BUSINESS   │ │   ENGAGEMENT     │
        │     LAYER        │ │     LAYER    │ │      LAYER       │
        └──────────────────┘ └──────────────┘ └──────────────────┘
```

---

## 🏗️ Layer 1: Foundation Layer (Core Tables)

### 1.1 Authentication & User Management

```
auth.users (Supabase Auth)
    │
    └─► profiles
            ├─ id (PK, FK → auth.users)
            ├─ phone
            ├─ email
            ├─ nickname
            ├─ full_name
            ├─ role (user/admin)
            ├─ address
            ├─ city
            ├─ state
            └─ pincode
```

**Relationships:**
- `profiles.id` → `auth.users.id` (One-to-One)
- First registered user automatically becomes admin

---

### 1.2 Product Catalog

```
products
    ├─ id (PK)
    ├─ product_code (UNIQUE)
    ├─ name
    ├─ category (ENUM)
    ├─ description
    ├─ base_price
    ├─ image_url
    ├─ stock
    ├─ is_active
    ├─ weight_per_kg
    └─ vendor_id (FK → vendors)
        │
        └─► product_variants
                ├─ id (PK)
                ├─ product_id (FK → products)
                ├─ packaging_size
                ├─ price
                ├─ cost_price
                ├─ discount_percentage
                ├─ stock
                └─ weight_kg
```

**Relationships:**
- `products` → `product_variants` (One-to-Many)
- `products.vendor_id` → `vendors.id` (Many-to-One)

**Categories:**
- millets (9 products)
- rice (4 products)
- flakes (14 products) ⭐
- sugar (2 products)
- honey (1 product)
- laddus (1 product)
- flour (10 products)

---

## 🛒 Layer 2: Business Layer (Transactions)

### 2.1 Order Management

```
orders
    ├─ id (PK)
    ├─ user_id (FK → profiles)
    ├─ order_type (online/instore)
    ├─ status (pending/processing/completed/cancelled/refunded)
    ├─ subtotal
    ├─ gst_rate
    ├─ gst_amount
    ├─ shipping_cost
    ├─ discount_amount
    ├─ total_amount
    ├─ payment_method (card/cash/upi/split)
    ├─ payment_status
    ├─ payment_details (JSONB)
    ├─ stripe_session_id
    ├─ stripe_payment_intent_id
    ├─ customer_name
    ├─ customer_email
    ├─ customer_phone
    ├─ shipping_address
    ├─ shipping_city
    ├─ shipping_state
    ├─ shipping_pincode
    ├─ points_used
    ├─ points_earned
    ├─ created_at
    ├─ updated_at
    └─ completed_at
        │
        ├─► order_items
        │       ├─ id (PK)
        │       ├─ order_id (FK → orders)
        │       ├─ product_id (FK → products)
        │       ├─ variant_id (FK → product_variants)
        │       ├─ product_name
        │       ├─ packaging_size
        │       ├─ unit_price
        │       ├─ quantity
        │       ├─ subtotal
        │       ├─ image_url
        │       └─ weight_kg
        │
        └─► shipments (for online orders)
                ├─ id (PK)
                ├─ order_id (FK → orders)
                ├─ handler_id (FK → shipment_handlers)
                ├─ tracking_number
                ├─ status
                ├─ shipping_address
                ├─ shipping_city
                ├─ shipping_state
                ├─ picked_up_at
                ├─ in_transit_at
                ├─ out_for_delivery_at
                └─ delivered_at
```

**Relationships:**
- `orders.user_id` → `profiles.id` (Many-to-One)
- `orders` → `order_items` (One-to-Many)
- `orders` → `shipments` (One-to-One for online orders)
- `order_items.product_id` → `products.id` (Many-to-One)
- `order_items.variant_id` → `product_variants.id` (Many-to-One)

---

### 2.2 Shipping & Logistics

```
shipment_handlers
    ├─ id (PK)
    ├─ name
    ├─ phone
    ├─ email
    ├─ vehicle_number
    └─ is_active
        │
        └─► shipments
                └─► handler_payments
                        ├─ id (PK)
                        ├─ handler_id (FK → shipment_handlers)
                        ├─ shipment_id (FK → shipments)
                        ├─ amount
                        ├─ payment_method
                        └─ payment_date

shipping_rates
    ├─ id (PK)
    ├─ state
    ├─ city
    ├─ base_rate
    ├─ per_kg_rate
    ├─ min_weight_kg
    ├─ max_weight_kg
    └─ is_active
```

**Relationships:**
- `shipments.handler_id` → `shipment_handlers.id` (Many-to-One)
- `handler_payments.handler_id` → `shipment_handlers.id` (Many-to-One)
- `handler_payments.shipment_id` → `shipments.id` (Many-to-One)

---

### 2.3 Vendor & Inventory Management

```
vendors
    ├─ id (PK)
    ├─ name
    ├─ contact_person
    ├─ email
    ├─ phone
    ├─ address
    ├─ gst_number
    ├─ payment_terms
    └─ is_active
        │
        ├─► vendor_supplies
        │       ├─ id (PK)
        │       ├─ vendor_id (FK → vendors)
        │       ├─ product_id (FK → products)
        │       ├─ variant_id (FK → product_variants)
        │       ├─ supply_cost
        │       ├─ minimum_order_quantity
        │       └─ lead_time_days
        │
        ├─► purchase_orders
        │       ├─ id (PK)
        │       ├─ po_number (UNIQUE)
        │       ├─ vendor_id (FK → vendors)
        │       ├─ status
        │       ├─ subtotal
        │       ├─ gst_amount
        │       ├─ total_amount
        │       ├─ order_date
        │       ├─ expected_delivery_date
        │       └─ received_date
        │           │
        │           └─► purchase_order_items
        │                   ├─ id (PK)
        │                   ├─ purchase_order_id (FK → purchase_orders)
        │                   ├─ product_id (FK → products)
        │                   ├─ variant_id (FK → product_variants)
        │                   ├─ quantity
        │                   ├─ unit_cost
        │                   ├─ subtotal
        │                   └─ received_quantity
        │
        └─► vendor_payments
                ├─ id (PK)
                ├─ vendor_id (FK → vendors)
                ├─ purchase_order_id (FK → purchase_orders)
                ├─ amount
                ├─ payment_method
                ├─ payment_date
                └─ reference_number
```

**Relationships:**
- `vendors` → `vendor_supplies` (One-to-Many)
- `vendors` → `purchase_orders` (One-to-Many)
- `vendors` → `vendor_payments` (One-to-Many)
- `purchase_orders` → `purchase_order_items` (One-to-Many)
- `vendor_supplies.product_id` → `products.id` (Many-to-One)
- `vendor_supplies.variant_id` → `product_variants.id` (Many-to-One)

---

## 💝 Layer 3: Engagement Layer (Customer Features)

### 3.1 Customer Engagement

```
profiles (user)
    │
    ├─► wishlists
    │       ├─ id (PK)
    │       ├─ user_id (FK → profiles)
    │       ├─ product_id (FK → products)
    │       └─ variant_id (FK → product_variants)
    │
    ├─► product_reviews
    │       ├─ id (PK)
    │       ├─ product_id (FK → products)
    │       ├─ user_id (FK → profiles)
    │       ├─ order_id (FK → orders)
    │       ├─ rating (1-5)
    │       ├─ title
    │       ├─ comment
    │       ├─ is_verified_purchase
    │       └─ is_approved
    │
    ├─► loyalty_points
    │       ├─ id (PK)
    │       ├─ user_id (FK → profiles)
    │       ├─ points
    │       ├─ transaction_type
    │       ├─ description
    │       ├─ order_id (FK → orders)
    │       └─ expires_at
    │
    ├─► notifications
    │       ├─ id (PK)
    │       ├─ user_id (FK → profiles)
    │       ├─ type
    │       ├─ title
    │       ├─ message
    │       ├─ is_read
    │       └─ link
    │
    └─► chat_messages
            ├─ id (PK)
            ├─ user_id (FK → profiles)
            ├─ admin_id (FK → profiles)
            ├─ message
            ├─ is_from_admin
            └─ is_read
```

**Relationships:**
- `wishlists.user_id` → `profiles.id` (Many-to-One)
- `wishlists.product_id` → `products.id` (Many-to-One)
- `product_reviews.user_id` → `profiles.id` (Many-to-One)
- `product_reviews.product_id` → `products.id` (Many-to-One)
- `loyalty_points.user_id` → `profiles.id` (Many-to-One)
- `notifications.user_id` → `profiles.id` (Many-to-One)
- `chat_messages.user_id` → `profiles.id` (Many-to-One)

---

## 🔗 Complete Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE ENTITY RELATIONSHIPS                        │
└──────────────────────────────────────────────────────────────────────────────┘

auth.users
    │
    └─► profiles (1:1)
            │
            ├─► orders (1:N)
            │       │
            │       ├─► order_items (1:N)
            │       │       ├─► products (N:1)
            │       │       └─► product_variants (N:1)
            │       │
            │       └─► shipments (1:1 for online orders)
            │               └─► shipment_handlers (N:1)
            │                       └─► handler_payments (1:N)
            │
            ├─► wishlists (1:N)
            │       ├─► products (N:1)
            │       └─► product_variants (N:1)
            │
            ├─► product_reviews (1:N)
            │       ├─► products (N:1)
            │       └─► orders (N:1)
            │
            ├─► loyalty_points (1:N)
            │       └─► orders (N:1)
            │
            ├─► notifications (1:N)
            │
            └─► chat_messages (1:N)

vendors
    │
    ├─► products (1:N)
    │       └─► product_variants (1:N)
    │
    ├─► vendor_supplies (1:N)
    │       ├─► products (N:1)
    │       └─► product_variants (N:1)
    │
    ├─► purchase_orders (1:N)
    │       └─► purchase_order_items (1:N)
    │               ├─► products (N:1)
    │               └─► product_variants (N:1)
    │
    └─► vendor_payments (1:N)
            └─► purchase_orders (N:1)

shipping_rates (Independent)
    ├─ state
    ├─ city
    ├─ base_rate
    └─ per_kg_rate
```

---

## 📋 Table Hierarchy by Dependency Level

### Level 0: Independent Tables (No Dependencies)
```
1. auth.users (Supabase managed)
2. shipping_rates
```

### Level 1: Direct Dependencies on Level 0
```
3. profiles (depends on: auth.users)
4. shipment_handlers (independent)
5. vendors (independent)
```

### Level 2: Dependencies on Level 1
```
6. products (depends on: vendors)
7. notifications (depends on: profiles)
8. chat_messages (depends on: profiles)
```

### Level 3: Dependencies on Level 2
```
9. product_variants (depends on: products)
10. orders (depends on: profiles)
11. wishlists (depends on: profiles, products)
12. product_reviews (depends on: profiles, products)
13. vendor_supplies (depends on: vendors, products)
14. purchase_orders (depends on: vendors)
```

### Level 4: Dependencies on Level 3
```
15. order_items (depends on: orders, products, product_variants)
16. shipments (depends on: orders, shipment_handlers)
17. loyalty_points (depends on: profiles, orders)
18. purchase_order_items (depends on: purchase_orders, products, product_variants)
```

### Level 5: Dependencies on Level 4
```
19. handler_payments (depends on: shipment_handlers, shipments)
20. vendor_payments (depends on: vendors, purchase_orders)
```

---

## 📊 Table Creation Order (For Fresh Database)

```sql
-- Step 1: Create ENUMs
CREATE TYPE product_category AS ENUM (...);
CREATE TYPE user_role AS ENUM (...);
CREATE TYPE order_status AS ENUM (...);
-- ... (all other enums)

-- Step 2: Level 0 & 1 Tables
CREATE TABLE profiles (...);
CREATE TABLE shipment_handlers (...);
CREATE TABLE vendors (...);
CREATE TABLE shipping_rates (...);

-- Step 3: Level 2 Tables
CREATE TABLE products (...);
CREATE TABLE notifications (...);
CREATE TABLE chat_messages (...);

-- Step 4: Level 3 Tables
CREATE TABLE product_variants (...);
CREATE TABLE orders (...);
CREATE TABLE wishlists (...);
CREATE TABLE product_reviews (...);
CREATE TABLE vendor_supplies (...);
CREATE TABLE purchase_orders (...);

-- Step 5: Level 4 Tables
CREATE TABLE order_items (...);
CREATE TABLE shipments (...);
CREATE TABLE loyalty_points (...);
CREATE TABLE purchase_order_items (...);

-- Step 6: Level 5 Tables
CREATE TABLE handler_payments (...);
CREATE TABLE vendor_payments (...);

-- Step 7: Functions & Triggers
CREATE FUNCTION handle_new_user() ...;
CREATE TRIGGER on_auth_user_confirmed ...;
-- ... (all other functions and triggers)
```

---

## 🔑 Primary Keys & Foreign Keys Summary

### Primary Keys (UUID)
All tables use UUID as primary key except:
- `auth.users` (managed by Supabase)

### Foreign Key Relationships

| Child Table | Foreign Key | Parent Table | Relationship |
|-------------|-------------|--------------|--------------|
| profiles | id | auth.users(id) | 1:1 |
| products | vendor_id | vendors(id) | N:1 |
| product_variants | product_id | products(id) | N:1 |
| orders | user_id | profiles(id) | N:1 |
| order_items | order_id | orders(id) | N:1 |
| order_items | product_id | products(id) | N:1 |
| order_items | variant_id | product_variants(id) | N:1 |
| shipments | order_id | orders(id) | 1:1 |
| shipments | handler_id | shipment_handlers(id) | N:1 |
| wishlists | user_id | profiles(id) | N:1 |
| wishlists | product_id | products(id) | N:1 |
| wishlists | variant_id | product_variants(id) | N:1 |
| product_reviews | user_id | profiles(id) | N:1 |
| product_reviews | product_id | products(id) | N:1 |
| product_reviews | order_id | orders(id) | N:1 |
| loyalty_points | user_id | profiles(id) | N:1 |
| loyalty_points | order_id | orders(id) | N:1 |
| notifications | user_id | profiles(id) | N:1 |
| chat_messages | user_id | profiles(id) | N:1 |
| chat_messages | admin_id | profiles(id) | N:1 |
| vendor_supplies | vendor_id | vendors(id) | N:1 |
| vendor_supplies | product_id | products(id) | N:1 |
| vendor_supplies | variant_id | product_variants(id) | N:1 |
| purchase_orders | vendor_id | vendors(id) | N:1 |
| purchase_order_items | purchase_order_id | purchase_orders(id) | N:1 |
| purchase_order_items | product_id | products(id) | N:1 |
| purchase_order_items | variant_id | product_variants(id) | N:1 |
| vendor_payments | vendor_id | vendors(id) | N:1 |
| vendor_payments | purchase_order_id | purchase_orders(id) | N:1 |
| handler_payments | handler_id | shipment_handlers(id) | N:1 |
| handler_payments | shipment_id | shipments(id) | N:1 |

---

## 📦 Product Catalog Structure

### Complete Product Hierarchy

```
PRODUCT CATALOG
│
├─ MILLETS (9 products)
│   ├─ MILLET001: Foxtail Millet
│   ├─ MILLET002: Little Millet
│   ├─ MILLET003: Browntop Millet
│   ├─ MILLET004: Kodo Millet
│   ├─ MILLET005: Barnyard Millet
│   ├─ MILLET006: Ragi (Finger Millet)
│   ├─ MILLET007: Natty Pearl Millet
│   ├─ MILLET008: Pearl Millet
│   └─ MILLET009: Proso Millet
│       └─ Variants: 1kg, 2kg, 5kg, 10kg (each)
│
├─ RICE (4 products)
│   ├─ RICE001: Karupukavini Rice
│   ├─ RICE002: Mapillai Sambha Rice
│   ├─ RICE003: Seeraga Samba Rice
│   └─ RICE004: Kaiviral Samba Rice
│       └─ Variants: 1kg, 2kg, 5kg, 10kg (each)
│
├─ FLAKES (14 products) ⭐ UPDATED
│   ├─ Millet-Based (6)
│   │   ├─ FLAKES001: Foxtail Flakes
│   │   ├─ FLAKES002: Little Flakes
│   │   ├─ FLAKES003: Kodo Flakes
│   │   ├─ FLAKES004: Barnyard Flakes
│   │   ├─ FLAKES005: Ragi Flakes
│   │   └─ FLAKES006: Pearl Flakes
│   │
│   ├─ Sorghum Flakes (2) ⭐ NEW
│   │   ├─ FLAKES007: Red Sorghum Flakes
│   │   └─ FLAKES008: White Sorghum Flakes
│   │
│   ├─ Gram Flakes (2) ⭐ NEW
│   │   ├─ FLAKES009: Green Gram Flakes
│   │   └─ FLAKES010: Horse Gram Flakes
│   │
│   ├─ Grain Flakes (2) ⭐ NEW
│   │   ├─ FLAKES011: Wheat Flakes
│   │   └─ FLAKES012: Barley Flakes
│   │
│   └─ Traditional Rice Flakes (2) ⭐ NEW
│       ├─ FLAKES013: Karupukavini Rice Flakes
│       └─ FLAKES014: Mapillai Sambha Rice Flakes
│           └─ Variants: 1kg, 2kg, 5kg, 10kg (each)
│
├─ SUGAR (2 products)
│   ├─ SUGAR001: Jaggery Powder
│   └─ SUGAR002: Palm Jaggery
│       └─ Variants: 1kg, 2kg, 5kg, 10kg (each)
│
├─ HONEY (1 product)
│   └─ HONEY001: Pure Organic Honey
│       └─ Variants: 200g, 500g, 1kg
│
├─ LADDUS (1 product)
│   └─ LADDU001: Ragi Laddu
│       └─ Variants: 1kg, 2kg, 5kg, 10kg
│
└─ FLOUR (10 products)
    ├─ FLOUR001: Foxtail Flour
    ├─ FLOUR002: Little Flour
    ├─ FLOUR003: Browntop Flour
    ├─ FLOUR004: Barnyard Flour
    ├─ FLOUR005: Ragi Flour
    ├─ FLOUR006: Natty Pearl Flour
    ├─ FLOUR007: Pearl Flour
    ├─ FLOUR008: Sorghum Flour
    ├─ FLOUR009: Proso Flour
    └─ FLOUR010: Millet Flour
        └─ Variants: 1kg, 2kg, 5kg, 10kg (each)

TOTAL SUMMARY:
├─ Total Products: 41
├─ Total Variants: 161
│   ├─ Millets: 36 variants (9 × 4)
│   ├─ Rice: 16 variants (4 × 4)
│   ├─ Flakes: 56 variants (14 × 4) ⭐
│   ├─ Sugar: 8 variants (2 × 4)
│   ├─ Honey: 3 variants (1 × 3)
│   ├─ Laddus: 4 variants (1 × 4)
│   └─ Flour: 40 variants (10 × 4)
```

---

## 🎯 Data Flow Diagrams

### Customer Order Flow

```
Customer (profiles)
    │
    ▼
Browse Products (products + product_variants)
    │
    ▼
Add to Cart (frontend state)
    │
    ▼
Checkout
    │
    ├─ Select Order Type
    │   ├─ Online Order
    │   │   ├─ Enter Shipping Address
    │   │   ├─ Calculate Shipping (shipping_rates)
    │   │   └─ Payment via Stripe
    │   │
    │   └─ In-Store Purchase
    │       └─ Payment: Cash/UPI/Split
    │
    ▼
Create Order (orders + order_items)
    │
    ├─ Deduct Loyalty Points (if used)
    ├─ Award Loyalty Points (loyalty_points)
    │
    └─ If Online Order
        └─ Create Shipment (shipments)
            └─ Assign Handler (shipment_handlers)
                └─ Track Delivery
                    └─ Pay Handler (handler_payments)
```

### Admin Inventory Flow

```
Vendor (vendors)
    │
    ▼
Create Purchase Order (purchase_orders)
    │
    └─► Add Items (purchase_order_items)
            ├─► Select Products (products)
            └─► Select Variants (product_variants)
    │
    ▼
Receive Goods
    │
    ├─ Update Stock (product_variants.stock)
    └─ Mark PO as Received
    │
    ▼
Make Payment (vendor_payments)
```

---

## 🔍 Key Indexes for Performance

### Products & Variants
```sql
idx_products_category ON products(category)
idx_products_code ON products(product_code)
idx_products_active ON products(is_active)
idx_variants_product ON product_variants(product_id)
idx_variants_size ON product_variants(packaging_size)
```

### Orders & Items
```sql
idx_orders_user ON orders(user_id)
idx_orders_status ON orders(status)
idx_orders_type ON orders(order_type)
idx_orders_created ON orders(created_at DESC)
idx_order_items_order ON order_items(order_id)
```

### Shipping & Logistics
```sql
idx_shipments_order ON shipments(order_id)
idx_shipments_handler ON shipments(handler_id)
idx_shipments_status ON shipments(status)
idx_shipping_rates_state ON shipping_rates(state)
idx_shipping_rates_city ON shipping_rates(city)
```

### Customer Engagement
```sql
idx_wishlists_user ON wishlists(user_id)
idx_reviews_product ON product_reviews(product_id)
idx_reviews_approved ON product_reviews(is_approved)
idx_loyalty_user ON loyalty_points(user_id)
idx_notifications_user ON notifications(user_id)
```

---

## 🛡️ Security (Row Level Security)

### Public Access (No Authentication Required)
- ✅ `products` (SELECT active products)
- ✅ `product_variants` (SELECT variants of active products)
- ✅ `product_reviews` (SELECT approved reviews)
- ✅ `shipping_rates` (SELECT active rates)

### User Access (Authentication Required)
- ✅ `profiles` (SELECT/UPDATE own profile)
- ✅ `orders` (SELECT own orders)
- ✅ `order_items` (SELECT items of own orders)
- ✅ `shipments` (SELECT shipments of own orders)
- ✅ `wishlists` (ALL operations on own wishlist)
- ✅ `product_reviews` (SELECT own reviews, INSERT/UPDATE own reviews)
- ✅ `loyalty_points` (SELECT own points)
- ✅ `notifications` (SELECT/UPDATE own notifications)
- ✅ `chat_messages` (SELECT own messages, INSERT messages)

### Admin Access (Admin Role Required)
- ✅ ALL tables (Full CRUD access)
- ✅ User management
- ✅ Product management
- ✅ Order management
- ✅ Vendor management
- ✅ Inventory management
- ✅ Payment tracking

---

## 📈 Database Statistics

### Table Count
```
Total Tables: 20
├─ Core Tables: 4 (profiles, products, product_variants, orders)
├─ Order Management: 3 (orders, order_items, shipments)
├─ Vendor Management: 5 (vendors, vendor_supplies, purchase_orders, purchase_order_items, vendor_payments)
├─ Shipping: 3 (shipment_handlers, shipments, shipping_rates, handler_payments)
└─ Customer Engagement: 5 (wishlists, product_reviews, loyalty_points, notifications, chat_messages)
```

### Record Count (Initial Data)
```
Products: 41
├─ Millets: 9
├─ Rice: 4
├─ Flakes: 14 ⭐
├─ Sugar: 2
├─ Honey: 1
├─ Laddus: 1
└─ Flour: 10

Product Variants: 161
├─ Standard (1kg, 2kg, 5kg, 10kg): 158 variants
└─ Honey (200g, 500g, 1kg): 3 variants

Shipping Rates: 13 cities
```

---

## 🎯 Key Features Supported

### E-Commerce Features
- ✅ Product catalog with categories
- ✅ Multiple packaging options
- ✅ Dynamic pricing with discounts
- ✅ Shopping cart (frontend)
- ✅ Checkout process
- ✅ Order management
- ✅ Payment processing (Stripe + Cash/UPI)
- ✅ Order tracking

### Customer Features
- ✅ User registration & login
- ✅ User profiles
- ✅ Wishlist management
- ✅ Product reviews & ratings
- ✅ Loyalty points system
- ✅ Order history
- ✅ Shipment tracking
- ✅ Notifications
- ✅ Customer support chat

### Admin Features
- ✅ Product management
- ✅ Inventory management
- ✅ Order management
- ✅ User management
- ✅ Vendor management
- ✅ Purchase order management
- ✅ Shipment tracking
- ✅ Payment tracking
- ✅ Review moderation
- ✅ Chat management

---

## 📝 SQL Script Files

### Schema Files
1. **COMPLETE_DATABASE_SCHEMA.sql** - Complete schema with all tables, functions, triggers
2. **COMPLETE_DATA_INSERTION.sql** - All product data and initial setup

### Migration Files (Applied)
- `00001_create_initial_schema.sql` - Initial schema
- `00002-00049_*.sql` - Various updates and features
- `20250201000001_update_flakes_products_final.sql` - Flakes category update ⭐

### Documentation Files
- **DATABASE_HIERARCHY.md** - This file (complete hierarchy)
- **FLAKES_UPDATE_COMPLETE.md** - Flakes category update details
- **FLAKES_CATEGORY_UPDATE.md** - Flakes category changes

---

## 🔧 Stored Procedures & Functions

### Available Functions

1. **is_admin(uid uuid)** → boolean
   - Check if user is admin

2. **calculate_shipping_cost(state, city, weight_kg)** → numeric
   - Calculate shipping cost based on location and weight

3. **create_order(...)** → TABLE(id, order_number)
   - Create order with items atomically

4. **add_loyalty_points(user_id, points, description, order_id)** → void
   - Add loyalty points to user account

5. **deduct_loyalty_points(user_id, points)** → void
   - Deduct loyalty points from user account

6. **get_loyalty_points_balance(user_id)** → integer
   - Get current loyalty points balance

---

## ✅ Database Setup Checklist

- [x] ENUMs created
- [x] Core tables created
- [x] Foreign keys established
- [x] Indexes created
- [x] RLS policies applied
- [x] Functions created
- [x] Triggers created
- [x] Products inserted (41 products)
- [x] Product variants created (161 variants)
- [x] Shipping rates inserted (13 cities)
- [x] Flakes category updated (14 products) ⭐

---

**Database Version:** 1.0  
**Last Updated:** 2025-12-01  
**Status:** ✅ Complete and Operational
