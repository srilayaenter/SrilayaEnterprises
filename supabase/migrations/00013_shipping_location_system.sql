/*
# Shipping and Location System

## Changes
1. Add weight field to products table
2. Add city and state fields to profiles table  
3. Recreate shipping_rates table with location-based pricing
4. Create shipping calculation function

## Tables Modified
- `products`: Add weight_per_kg field
- `profiles`: Add city and state fields
- `shipping_rates`: New structure for location-based rates

## Notes
- Weight stored in kilograms
- Local (same state): Rs.30-50 per kg
- Interstate: Rs.70-100 per kg
*/

-- Add weight field to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight_per_kg DECIMAL(10, 2) DEFAULT 1.0;

-- Add location fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Update existing products
UPDATE products SET weight_per_kg = 1.0 WHERE weight_per_kg IS NULL;

-- Drop and recreate shipping_rates table
DROP TABLE IF EXISTS shipping_rates CASCADE;

CREATE TABLE shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_state TEXT NOT NULL DEFAULT 'Karnataka',
  store_city TEXT NOT NULL DEFAULT 'Bangalore',
  local_rate_min DECIMAL(10, 2) NOT NULL DEFAULT 30.00,
  local_rate_max DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
  interstate_rate_min DECIMAL(10, 2) NOT NULL DEFAULT 70.00,
  interstate_rate_max DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO shipping_rates (store_state, store_city)
VALUES ('Karnataka', 'Bangalore');

-- Drop all versions of calculate_shipping_cost
DROP FUNCTION IF EXISTS calculate_shipping_cost(DECIMAL);
DROP FUNCTION IF EXISTS calculate_shipping_cost(NUMERIC);
DROP FUNCTION IF EXISTS calculate_shipping_cost(TEXT, TEXT, DECIMAL);
DROP FUNCTION IF EXISTS calculate_shipping_cost(TEXT, TEXT, NUMERIC);

-- Create new shipping calculation function
CREATE FUNCTION calculate_shipping_cost(
  p_customer_state TEXT,
  p_customer_city TEXT,
  p_total_weight NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  v_config RECORD;
  v_is_local BOOLEAN;
  v_base_rate NUMERIC;
BEGIN
  SELECT * INTO v_config FROM shipping_rates LIMIT 1;
  
  v_is_local := (LOWER(TRIM(COALESCE(p_customer_state, ''))) = LOWER(TRIM(v_config.store_state)));
  
  IF v_is_local THEN
    v_base_rate := (v_config.local_rate_min + v_config.local_rate_max) / 2;
  ELSE
    v_base_rate := (v_config.interstate_rate_min + v_config.interstate_rate_max) / 2;
  END IF;
  
  RETURN CEIL(p_total_weight) * v_base_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view shipping rates" ON shipping_rates
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can modify shipping rates" ON shipping_rates
  FOR ALL TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));