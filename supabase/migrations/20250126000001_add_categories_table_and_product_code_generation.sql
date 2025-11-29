/*
# Add Categories Table and Product Code Auto-Generation

## 1. New Tables

### categories
- `id` (uuid, primary key)
- `name` (text, unique, not null) - Category name (e.g., "Millets", "Rice")
- `slug` (text, unique, not null) - URL-friendly slug (e.g., "millets", "rice")
- `description` (text) - Category description
- `display_order` (integer) - Order for display
- `is_active` (boolean, default true)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## 2. Product Code Generation

- Add `product_code` column to products table (if not exists)
- Create function to auto-generate product codes
- Format: {CATEGORY_PREFIX}-{SEQUENCE} (e.g., MIL-001, RIC-002)
- Trigger to auto-generate on insert if not provided

## 3. Migration Strategy

- Create categories table
- Populate with existing categories from enum
- Add product_code column to products
- Create auto-generation function and trigger
- Keep product_category enum for backward compatibility

## 4. Security

- Public read access to categories
- Admin write access to categories
- RLS policies applied
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add product_code column to products if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'product_code'
  ) THEN
    ALTER TABLE products ADD COLUMN product_code text UNIQUE;
  END IF;
END $$;

-- Populate categories table with existing categories
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Millets', 'millets', 'Nutritious and gluten-free ancient grains', 1),
  ('Rice', 'rice', 'Premium quality organic rice varieties', 2),
  ('Flour', 'flour', 'Freshly ground organic flours', 3),
  ('Flakes', 'flakes', 'Healthy breakfast flakes', 4),
  ('Sugar', 'sugar', 'Natural and organic sweeteners', 5),
  ('Honey', 'honey', 'Pure and natural honey', 6),
  ('Laddus', 'laddus', 'Traditional healthy sweets', 7)
ON CONFLICT (slug) DO NOTHING;

-- Function to get category prefix for product code
CREATE OR REPLACE FUNCTION get_category_prefix(cat product_category)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN CASE cat
    WHEN 'millets' THEN 'MIL'
    WHEN 'rice' THEN 'RIC'
    WHEN 'flour' THEN 'FLR'
    WHEN 'flakes' THEN 'FLK'
    WHEN 'sugar' THEN 'SUG'
    WHEN 'honey' THEN 'HON'
    WHEN 'laddus' THEN 'LAD'
    ELSE 'PRD'
  END;
END;
$$;

-- Function to generate next product code for a category
CREATE OR REPLACE FUNCTION generate_product_code(cat product_category)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  prefix text;
  next_num integer;
  new_code text;
BEGIN
  -- Get category prefix
  prefix := get_category_prefix(cat);
  
  -- Find the highest number for this category
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(product_code FROM '[0-9]+$') AS integer
    )
  ), 0) + 1
  INTO next_num
  FROM products
  WHERE product_code LIKE prefix || '-%';
  
  -- Generate new code with zero-padded number
  new_code := prefix || '-' || LPAD(next_num::text, 3, '0');
  
  RETURN new_code;
END;
$$;

-- Trigger function to auto-generate product code
CREATE OR REPLACE FUNCTION auto_generate_product_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only generate if product_code is not provided
  IF NEW.product_code IS NULL OR NEW.product_code = '' THEN
    NEW.product_code := generate_product_code(NEW.category);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating product codes
DROP TRIGGER IF EXISTS trigger_auto_generate_product_code ON products;
CREATE TRIGGER trigger_auto_generate_product_code
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_product_code();

-- Update existing products with product codes if they don't have one
DO $$
DECLARE
  prod RECORD;
BEGIN
  FOR prod IN 
    SELECT id, category 
    FROM products 
    WHERE product_code IS NULL OR product_code = ''
  LOOP
    UPDATE products 
    SET product_code = generate_product_code(prod.category)
    WHERE id = prod.id;
  END LOOP;
END $$;

-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create updated_at trigger for categories
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on product_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
