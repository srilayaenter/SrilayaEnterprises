/*
# Create Initial Schema for Srilaya Enterprises Organic Store

## 1. New Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `email` (text, unique)
- `full_name` (text)
- `phone` (text)
- `address` (text)
- `role` (user_role enum: 'user', 'admin')
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### products
- `id` (uuid, primary key)
- `name` (text, not null)
- `description` (text)
- `category` (product_category enum)
- `base_price` (numeric, not null)
- `image_url` (text)
- `stock` (integer, default 0)
- `is_active` (boolean, default true)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### product_variants
- `id` (uuid, primary key)
- `product_id` (uuid, references products)
- `packaging_size` (text, not null)
- `price` (numeric, not null)
- `stock` (integer, default 0)
- `created_at` (timestamptz)

### orders
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `items` (jsonb, not null)
- `total_amount` (numeric, not null)
- `currency` (text, default 'usd')
- `status` (order_status enum)
- `stripe_session_id` (text, unique)
- `stripe_payment_intent_id` (text)
- `customer_email` (text)
- `customer_name` (text)
- `shipping_address` (text)
- `completed_at` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## 2. Security

- Enable RLS on all tables
- Create admin helper function
- Profiles: Admins full access, users can view/update own profile
- Products: Public read, admin write
- Product Variants: Public read, admin write
- Orders: Users view own orders, admins view all, service role manages

## 3. Triggers

- Auto-create profile on user signup (first user becomes admin)
- Auto-update timestamps

## 4. Initial Data

- Sample products for each category with variants
*/

-- Create enums
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE product_category AS ENUM ('millets', 'rice', 'flakes', 'sugar', 'honey', 'laddus');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  phone text,
  address text,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category product_category NOT NULL,
  base_price numeric(10,2) NOT NULL,
  image_url text,
  stock integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  packaging_size text NOT NULL,
  price numeric(10,2) NOT NULL,
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  items jsonb NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'usd',
  status order_status DEFAULT 'pending'::order_status NOT NULL,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  customer_email text,
  customer_name text,
  shipping_address text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (role IS NOT DISTINCT FROM old.role);

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (is_admin(auth.uid()));

-- Product variants policies (public read, admin write)
CREATE POLICY "Anyone can view product variants" ON product_variants
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage product variants" ON product_variants
  FOR ALL USING (is_admin(auth.uid()));

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Service role can manage orders" ON orders
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    SELECT COUNT(*) INTO user_count FROM profiles;
    INSERT INTO profiles (id, email, role)
    VALUES (
      NEW.id,
      NEW.email,
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert sample products
INSERT INTO products (name, description, category, base_price, image_url, stock, is_active) VALUES
('Foxtail Millet', 'Premium quality foxtail millet, rich in protein and fiber. Perfect for a healthy diet.', 'millets', 8.99, 'placeholder-foxtail-millet.jpg', 100, true),
('Pearl Millet', 'Organic pearl millet (Bajra), excellent source of iron and magnesium.', 'millets', 7.99, 'placeholder-pearl-millet.jpg', 100, true),
('Finger Millet', 'Nutritious finger millet (Ragi), high in calcium and amino acids.', 'millets', 9.99, 'placeholder-finger-millet.jpg', 100, true),
('Basmati Rice', 'Aromatic organic basmati rice, aged for superior taste and texture.', 'rice', 12.99, 'placeholder-basmati-rice.jpg', 150, true),
('Brown Rice', 'Whole grain brown rice, packed with nutrients and fiber.', 'rice', 10.99, 'placeholder-brown-rice.jpg', 150, true),
('Red Rice', 'Organic red rice, rich in antioxidants and minerals.', 'rice', 11.99, 'placeholder-red-rice.jpg', 120, true),
('Oat Flakes', 'Rolled oat flakes, perfect for a quick and healthy breakfast.', 'flakes', 6.99, 'placeholder-oat-flakes.jpg', 80, true),
('Corn Flakes', 'Crispy organic corn flakes, made from non-GMO corn.', 'flakes', 5.99, 'placeholder-corn-flakes.jpg', 80, true),
('Rice Flakes', 'Traditional rice flakes (Poha), light and easy to digest.', 'flakes', 4.99, 'placeholder-rice-flakes.jpg', 90, true),
('Jaggery Powder', 'Pure organic jaggery powder, natural sweetener rich in iron.', 'sugar', 7.99, 'placeholder-jaggery-powder.jpg', 100, true),
('Coconut Sugar', 'Low glycemic coconut sugar, perfect for health-conscious individuals.', 'sugar', 9.99, 'placeholder-coconut-sugar.jpg', 80, true),
('Raw Honey', 'Pure raw honey, unprocessed and full of natural enzymes.', 'honey', 14.99, 'placeholder-raw-honey.jpg', 60, true),
('Forest Honey', 'Wild forest honey, collected from pristine forest areas.', 'honey', 18.99, 'placeholder-forest-honey.jpg', 40, true),
('Manuka Honey', 'Premium manuka honey, known for its antibacterial properties.', 'honey', 29.99, 'placeholder-manuka-honey.jpg', 30, true),
('Ragi Laddu', 'Traditional ragi laddus, healthy and delicious snack.', 'laddus', 11.99, 'placeholder-ragi-laddu.jpg', 50, true),
('Sesame Laddu', 'Nutritious sesame laddus, rich in calcium and healthy fats.', 'laddus', 10.99, 'placeholder-sesame-laddu.jpg', 50, true),
('Dry Fruit Laddu', 'Premium dry fruit laddus, packed with nuts and natural sweetness.', 'laddus', 15.99, 'placeholder-dry-fruit-laddu.jpg', 40, true);

-- Insert product variants
INSERT INTO product_variants (product_id, packaging_size, price, stock)
SELECT id, '1kg', base_price, 50 FROM products WHERE category IN ('millets', 'rice', 'flakes', 'sugar', 'laddus')
UNION ALL
SELECT id, '2kg', base_price * 1.9, 40 FROM products WHERE category IN ('millets', 'rice', 'flakes', 'sugar', 'laddus')
UNION ALL
SELECT id, '5kg', base_price * 4.5, 30 FROM products WHERE category IN ('millets', 'rice', 'flakes', 'sugar', 'laddus')
UNION ALL
SELECT id, '10kg', base_price * 8.5, 20 FROM products WHERE category IN ('millets', 'rice', 'flakes', 'sugar', 'laddus')
UNION ALL
SELECT id, '200g', base_price * 0.4, 30 FROM products WHERE category = 'honey'
UNION ALL
SELECT id, '500g', base_price, 40 FROM products WHERE category = 'honey'
UNION ALL
SELECT id, '1kg', base_price * 1.8, 25 FROM products WHERE category = 'honey';