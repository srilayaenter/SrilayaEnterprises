-- ============================================================================
-- SRILAYA ENTERPRISES ORGANIC STORE - COMPLETE DATABASE SCHEMA
-- Database: PostgreSQL (Supabase)
-- Version: 1.0
-- Date: 2025-12-01
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENUMS AND CUSTOM TYPES
-- ============================================================================

-- Product Category Enum
CREATE TYPE product_category AS ENUM (
    'millets',
    'rice',
    'flakes',
    'sugar',
    'honey',
    'laddus',
    'flour'
);

-- User Role Enum
CREATE TYPE user_role AS ENUM (
    'user',
    'admin'
);

-- Order Status Enum
CREATE TYPE order_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'cancelled',
    'refunded'
);

-- Order Type Enum
CREATE TYPE order_type AS ENUM (
    'online',
    'instore'
);

-- Payment Status Enum
CREATE TYPE payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);

-- Payment Method Enum
CREATE TYPE payment_method AS ENUM (
    'card',
    'cash',
    'upi',
    'split'
);

-- Shipment Status Enum
CREATE TYPE shipment_status AS ENUM (
    'pending',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned'
);

-- Purchase Order Status Enum
CREATE TYPE purchase_order_status AS ENUM (
    'draft',
    'pending',
    'approved',
    'received',
    'cancelled'
);

-- Notification Type Enum
CREATE TYPE notification_type AS ENUM (
    'order',
    'payment',
    'shipment',
    'promotion',
    'system'
);

-- ============================================================================
-- SECTION 2: CORE TABLES (Foundation)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 Profiles Table (User Management)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone text UNIQUE,
    email text UNIQUE,
    nickname text,
    full_name text,
    role user_role DEFAULT 'user'::user_role NOT NULL,
    address text,
    city text,
    state text,
    pincode text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Profiles RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = uid AND p.role = 'admin'::user_role
    );
$$;

-- Admins have full access
CREATE POLICY "Admins have full access" ON profiles
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Users can view own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update own profile without changing role
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id) 
    WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Public profiles view (for sharing)
CREATE OR REPLACE VIEW public_profiles AS
SELECT
    id,
    nickname,
    full_name
FROM profiles;

-- ----------------------------------------------------------------------------
-- 2.2 Products Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code text UNIQUE NOT NULL,
    name text NOT NULL,
    category product_category NOT NULL,
    description text,
    base_price numeric(10, 2) NOT NULL CHECK (base_price >= 0),
    image_url text,
    stock integer DEFAULT 0 CHECK (stock >= 0),
    is_active boolean DEFAULT true,
    weight_per_kg numeric(10, 3) DEFAULT 1.0,
    vendor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Products Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);

-- Products RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Everyone can view active products
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Admins can manage all products
CREATE POLICY "Admins can manage products" ON products
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 2.3 Product Variants Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    packaging_size text NOT NULL,
    price numeric(10, 2) NOT NULL CHECK (price >= 0),
    cost_price numeric(10, 2) CHECK (cost_price >= 0),
    discount_percentage numeric(5, 2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    stock integer DEFAULT 0 CHECK (stock >= 0),
    weight_kg numeric(10, 3) NOT NULL CHECK (weight_kg > 0),
    created_at timestamptz DEFAULT now(),
    UNIQUE(product_id, packaging_size)
);

-- Product Variants Indexes
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_size ON product_variants(packaging_size);

-- Product Variants RLS Policies
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Everyone can view variants of active products
CREATE POLICY "Anyone can view variants" ON product_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products p 
            WHERE p.id = product_variants.product_id AND p.is_active = true
        )
    );

-- Admins can manage variants
CREATE POLICY "Admins can manage variants" ON product_variants
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ============================================================================
-- SECTION 3: ORDER MANAGEMENT TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 Orders Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    order_type order_type DEFAULT 'online'::order_type NOT NULL,
    status order_status DEFAULT 'pending'::order_status NOT NULL,
    
    -- Pricing
    subtotal numeric(10, 2) NOT NULL CHECK (subtotal >= 0),
    gst_rate numeric(5, 2) DEFAULT 5.00,
    gst_amount numeric(10, 2) DEFAULT 0,
    shipping_cost numeric(10, 2) DEFAULT 0 CHECK (shipping_cost >= 0),
    discount_amount numeric(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
    
    -- Payment
    payment_method payment_method,
    payment_status payment_status DEFAULT 'pending'::payment_status,
    payment_details jsonb,
    stripe_session_id text,
    stripe_payment_intent_id text,
    
    -- Customer Information
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text NOT NULL,
    
    -- Shipping Information (for online orders)
    shipping_address text,
    shipping_city text,
    shipping_state text,
    shipping_pincode text,
    
    -- Loyalty Points
    points_used integer DEFAULT 0 CHECK (points_used >= 0),
    points_earned integer DEFAULT 0 CHECK (points_earned >= 0),
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- Orders Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);

-- Orders RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Admins can update orders
CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 3.2 Order Items Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id) ON DELETE SET NULL,
    variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
    
    -- Product snapshot (in case product is deleted)
    product_name text NOT NULL,
    packaging_size text NOT NULL,
    unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity integer NOT NULL CHECK (quantity > 0),
    subtotal numeric(10, 2) NOT NULL CHECK (subtotal >= 0),
    
    -- Additional info
    image_url text,
    weight_kg numeric(10, 3),
    
    created_at timestamptz DEFAULT now()
);

-- Order Items Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items(variant_id);

-- Order Items RLS Policies
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can view items of their own orders
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
        )
    );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- ============================================================================
-- SECTION 4: SHIPPING & LOGISTICS TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 Shipment Handlers Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipment_handlers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    vehicle_number text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Shipment Handlers Indexes
CREATE INDEX IF NOT EXISTS idx_handlers_active ON shipment_handlers(is_active);

-- Shipment Handlers RLS Policies
ALTER TABLE shipment_handlers ENABLE ROW LEVEL SECURITY;

-- Admins can manage handlers
CREATE POLICY "Admins can manage handlers" ON shipment_handlers
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 4.2 Shipments Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    handler_id uuid REFERENCES shipment_handlers(id) ON DELETE SET NULL,
    
    tracking_number text UNIQUE,
    status shipment_status DEFAULT 'pending'::shipment_status NOT NULL,
    
    -- Shipping details
    shipping_address text NOT NULL,
    shipping_city text NOT NULL,
    shipping_state text NOT NULL,
    shipping_pincode text,
    
    -- Dates
    picked_up_at timestamptz,
    in_transit_at timestamptz,
    out_for_delivery_at timestamptz,
    delivered_at timestamptz,
    
    -- Additional info
    notes text,
    weight_kg numeric(10, 3),
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Shipments Indexes
CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_handler ON shipments(handler_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);

-- Shipments RLS Policies
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Users can view shipments of their own orders
CREATE POLICY "Users can view own shipments" ON shipments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o 
            WHERE o.id = shipments.order_id AND o.user_id = auth.uid()
        )
    );

-- Admins can manage all shipments
CREATE POLICY "Admins can manage shipments" ON shipments
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 4.3 Shipping Rates Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipping_rates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    state text NOT NULL,
    city text NOT NULL,
    base_rate numeric(10, 2) NOT NULL CHECK (base_rate >= 0),
    per_kg_rate numeric(10, 2) NOT NULL CHECK (per_kg_rate >= 0),
    min_weight_kg numeric(10, 3) DEFAULT 0,
    max_weight_kg numeric(10, 3),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(state, city)
);

-- Shipping Rates Indexes
CREATE INDEX IF NOT EXISTS idx_shipping_rates_state ON shipping_rates(state);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_city ON shipping_rates(city);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_active ON shipping_rates(is_active);

-- Shipping Rates RLS Policies
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

-- Everyone can view active shipping rates
CREATE POLICY "Anyone can view shipping rates" ON shipping_rates
    FOR SELECT USING (is_active = true);

-- Admins can manage shipping rates
CREATE POLICY "Admins can manage shipping rates" ON shipping_rates
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ============================================================================
-- SECTION 5: VENDOR & INVENTORY MANAGEMENT TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 Vendors Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    contact_person text NOT NULL,
    email text,
    phone text NOT NULL,
    address text,
    gst_number text,
    payment_terms text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Vendors Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);

-- Vendors RLS Policies
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Admins can manage vendors
CREATE POLICY "Admins can manage vendors" ON vendors
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 5.2 Purchase Orders Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number text UNIQUE NOT NULL,
    vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    
    status purchase_order_status DEFAULT 'draft'::purchase_order_status NOT NULL,
    
    -- Pricing
    subtotal numeric(10, 2) NOT NULL CHECK (subtotal >= 0),
    gst_amount numeric(10, 2) DEFAULT 0,
    total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
    
    -- Dates
    order_date date NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date date,
    received_date date,
    
    -- Additional info
    notes text,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Purchase Orders Indexes
CREATE INDEX IF NOT EXISTS idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_po_date ON purchase_orders(order_date DESC);

-- Purchase Orders RLS Policies
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- Admins can manage purchase orders
CREATE POLICY "Admins can manage purchase orders" ON purchase_orders
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 5.3 Purchase Order Items Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id uuid REFERENCES product_variants(id) ON DELETE RESTRICT,
    
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_cost numeric(10, 2) NOT NULL CHECK (unit_cost >= 0),
    subtotal numeric(10, 2) NOT NULL CHECK (subtotal >= 0),
    
    received_quantity integer DEFAULT 0 CHECK (received_quantity >= 0),
    
    created_at timestamptz DEFAULT now()
);

-- Purchase Order Items Indexes
CREATE INDEX IF NOT EXISTS idx_po_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_items_product ON purchase_order_items(product_id);

-- Purchase Order Items RLS Policies
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Admins can manage PO items
CREATE POLICY "Admins can manage PO items" ON purchase_order_items
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 5.4 Vendor Supplies Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_supplies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
    
    supply_cost numeric(10, 2) NOT NULL CHECK (supply_cost >= 0),
    minimum_order_quantity integer DEFAULT 1,
    lead_time_days integer DEFAULT 7,
    
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(vendor_id, product_id, variant_id)
);

-- Vendor Supplies Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_supplies_vendor ON vendor_supplies(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_supplies_product ON vendor_supplies(product_id);
CREATE INDEX IF NOT EXISTS idx_vendor_supplies_active ON vendor_supplies(is_active);

-- Vendor Supplies RLS Policies
ALTER TABLE vendor_supplies ENABLE ROW LEVEL SECURITY;

-- Admins can manage vendor supplies
CREATE POLICY "Admins can manage vendor supplies" ON vendor_supplies
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ============================================================================
-- SECTION 6: PAYMENT TRACKING TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6.1 Vendor Payments Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    purchase_order_id uuid REFERENCES purchase_orders(id) ON DELETE SET NULL,
    
    amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
    payment_method text,
    payment_date date NOT NULL DEFAULT CURRENT_DATE,
    
    reference_number text,
    notes text,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Vendor Payments Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor ON vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_po ON vendor_payments(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_date ON vendor_payments(payment_date DESC);

-- Vendor Payments RLS Policies
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;

-- Admins can manage vendor payments
CREATE POLICY "Admins can manage vendor payments" ON vendor_payments
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 6.2 Handler Payments Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS handler_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    handler_id uuid NOT NULL REFERENCES shipment_handlers(id) ON DELETE RESTRICT,
    shipment_id uuid REFERENCES shipments(id) ON DELETE SET NULL,
    
    amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
    payment_method text,
    payment_date date NOT NULL DEFAULT CURRENT_DATE,
    
    reference_number text,
    notes text,
    
    created_at timestamptz DEFAULT now()
);

-- Handler Payments Indexes
CREATE INDEX IF NOT EXISTS idx_handler_payments_handler ON handler_payments(handler_id);
CREATE INDEX IF NOT EXISTS idx_handler_payments_shipment ON handler_payments(shipment_id);
CREATE INDEX IF NOT EXISTS idx_handler_payments_date ON handler_payments(payment_date DESC);

-- Handler Payments RLS Policies
ALTER TABLE handler_payments ENABLE ROW LEVEL SECURITY;

-- Admins can manage handler payments
CREATE POLICY "Admins can manage handler payments" ON handler_payments
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ============================================================================
-- SECTION 7: CUSTOMER ENGAGEMENT TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1 Wishlists Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
    
    created_at timestamptz DEFAULT now(),
    
    UNIQUE(user_id, product_id, variant_id)
);

-- Wishlists Indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON wishlists(product_id);

-- Wishlists RLS Policies
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Users can manage their own wishlist
CREATE POLICY "Users can manage own wishlist" ON wishlists
    FOR ALL USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 7.2 Product Reviews Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
    
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title text,
    comment text,
    
    is_verified_purchase boolean DEFAULT false,
    is_approved boolean DEFAULT false,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(product_id, user_id, order_id)
);

-- Product Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);

-- Product Reviews RLS Policies
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews" ON product_reviews
    FOR SELECT USING (is_approved = true);

-- Users can view their own reviews
CREATE POLICY "Users can view own reviews" ON product_reviews
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create reviews
CREATE POLICY "Users can create reviews" ON product_reviews
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON product_reviews
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 7.3 Loyalty Points Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loyalty_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    points integer NOT NULL,
    transaction_type text NOT NULL,
    description text,
    order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
    
    expires_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Loyalty Points Indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_user ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_order ON loyalty_points(order_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_created ON loyalty_points(created_at DESC);

-- Loyalty Points RLS Policies
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- Users can view their own loyalty points
CREATE POLICY "Users can view own loyalty points" ON loyalty_points
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage loyalty points
CREATE POLICY "Admins can manage loyalty points" ON loyalty_points
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 7.4 Notifications Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    type notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    
    is_read boolean DEFAULT false,
    link text,
    
    created_at timestamptz DEFAULT now()
);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Notifications RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can create notifications
CREATE POLICY "Admins can create notifications" ON notifications
    FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 7.5 Chat Messages Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    
    message text NOT NULL,
    is_from_admin boolean DEFAULT false,
    is_read boolean DEFAULT false,
    
    created_at timestamptz DEFAULT now()
);

-- Chat Messages Indexes
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_admin ON chat_messages(admin_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at DESC);

-- Chat Messages RLS Policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own chat messages
CREATE POLICY "Users can view own chat" ON chat_messages
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = admin_id);

-- Users can create chat messages
CREATE POLICY "Users can create chat messages" ON chat_messages
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admins can manage all chat messages
CREATE POLICY "Admins can manage chat" ON chat_messages
    FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ============================================================================
-- SECTION 8: STORED PROCEDURES & FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 8.1 Calculate Shipping Cost Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
    p_state text,
    p_city text,
    p_weight_kg numeric
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
    v_base_rate numeric;
    v_per_kg_rate numeric;
    v_total_cost numeric;
BEGIN
    -- Get shipping rates for the location
    SELECT base_rate, per_kg_rate
    INTO v_base_rate, v_per_kg_rate
    FROM shipping_rates
    WHERE state = p_state 
      AND city = p_city 
      AND is_active = true
      AND (max_weight_kg IS NULL OR p_weight_kg <= max_weight_kg)
    LIMIT 1;
    
    -- If no rate found, return default
    IF v_base_rate IS NULL THEN
        RETURN 100.00; -- Default shipping cost
    END IF;
    
    -- Calculate total cost
    v_total_cost := v_base_rate + (v_per_kg_rate * p_weight_kg);
    
    RETURN ROUND(v_total_cost, 2);
END;
$$;

-- ----------------------------------------------------------------------------
-- 8.2 Create Order Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_order(
    p_user_id uuid,
    p_items jsonb,
    p_total_amount numeric,
    p_gst_rate numeric,
    p_gst_amount numeric,
    p_shipping_cost numeric,
    p_points_used integer,
    p_currency text,
    p_status order_status,
    p_order_type order_type,
    p_payment_method payment_method,
    p_payment_details jsonb,
    p_customer_name text,
    p_customer_email text,
    p_customer_phone text,
    p_completed_at timestamptz DEFAULT NULL
)
RETURNS TABLE(id uuid, order_number text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id uuid;
    v_subtotal numeric;
    v_item jsonb;
BEGIN
    -- Calculate subtotal
    v_subtotal := p_total_amount - p_gst_amount - p_shipping_cost;
    
    -- Create order
    INSERT INTO orders (
        user_id,
        order_type,
        status,
        subtotal,
        gst_rate,
        gst_amount,
        shipping_cost,
        total_amount,
        payment_method,
        payment_status,
        payment_details,
        customer_name,
        customer_email,
        customer_phone,
        points_used,
        completed_at
    )
    VALUES (
        p_user_id,
        p_order_type,
        p_status,
        v_subtotal,
        p_gst_rate,
        p_gst_amount,
        p_shipping_cost,
        p_total_amount,
        p_payment_method,
        CASE WHEN p_status = 'completed' THEN 'completed'::payment_status ELSE 'pending'::payment_status END,
        p_payment_details,
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        p_points_used,
        p_completed_at
    )
    RETURNING orders.id INTO v_order_id;
    
    -- Insert order items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO order_items (
            order_id,
            product_id,
            variant_id,
            product_name,
            packaging_size,
            unit_price,
            quantity,
            subtotal,
            image_url,
            weight_kg
        )
        VALUES (
            v_order_id,
            (v_item->>'product_id')::uuid,
            (v_item->>'variant_id')::uuid,
            v_item->>'name',
            v_item->>'packaging_size',
            (v_item->>'price')::numeric,
            (v_item->>'quantity')::integer,
            (v_item->>'price')::numeric * (v_item->>'quantity')::integer,
            v_item->>'image_url',
            (v_item->>'weight_kg')::numeric
        );
    END LOOP;
    
    RETURN QUERY SELECT v_order_id, v_order_id::text;
END;
$$;

-- ----------------------------------------------------------------------------
-- 8.3 Add Loyalty Points Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION add_loyalty_points(
    p_user_id uuid,
    p_points integer,
    p_description text,
    p_order_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO loyalty_points (
        user_id,
        points,
        transaction_type,
        description,
        order_id,
        expires_at
    )
    VALUES (
        p_user_id,
        p_points,
        'earned',
        p_description,
        p_order_id,
        now() + interval '1 year'
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 8.4 Deduct Loyalty Points Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION deduct_loyalty_points(
    p_user_id uuid,
    p_points integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO loyalty_points (
        user_id,
        points,
        transaction_type,
        description
    )
    VALUES (
        p_user_id,
        -p_points,
        'redeemed',
        'Points redeemed for purchase'
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 8.5 Get User Loyalty Points Balance Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_loyalty_points_balance(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance integer;
BEGIN
    SELECT COALESCE(SUM(points), 0)
    INTO v_balance
    FROM loyalty_points
    WHERE user_id = p_user_id
      AND (expires_at IS NULL OR expires_at > now());
    
    RETURN v_balance;
END;
$$;

-- ============================================================================
-- SECTION 9: TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 9.1 Auto-sync User to Profiles Trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_count int;
BEGIN
    -- Count existing users
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    -- Insert new profile
    INSERT INTO profiles (id, phone, email, role)
    VALUES (
        NEW.id,
        NEW.phone,
        NEW.email,
        CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
    );
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_confirmed
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
    EXECUTE FUNCTION handle_new_user();

-- ----------------------------------------------------------------------------
-- 9.2 Update Timestamps Trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
