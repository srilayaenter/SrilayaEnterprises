/*
# Add Shipping and Location Fields

## Changes
1. Add weight field to products table
2. Add city and state fields to profiles table
3. Add store location configuration
4. Update shipping_rates table structure

## Tables Modified
- `products`: Add weight_per_kg field
- `profiles`: Add city and state fields
- `shipping_rates`: Update for weight-based calculation

## Notes
- Weight is stored in kilograms
- Shipping rates: Rs.30-50 (local), Rs.70-100 (interstate)
- Store location: Will be configured in shipping_rates
*/

-- Add weight field to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight_per_kg DECIMAL(10, 2) DEFAULT 1.0;

COMMENT ON COLUMN products.weight_per_kg IS 'Weight per kilogram for shipping calculation';

-- Add location fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

COMMENT ON COLUMN profiles.city IS 'Customer city for shipping calculation';
COMMENT ON COLUMN profiles.state IS 'Customer state for shipping calculation';

-- Drop existing shipping_rates table and recreate with new structure
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

COMMENT ON TABLE shipping_rates IS 'Shipping rate configuration based on location';

-- Insert default shipping configuration
INSERT INTO shipping_rates (store_state, store_city, local_rate_min, local_rate_max, interstate_rate_min, interstate_rate_max)
VALUES ('Karnataka', 'Bangalore', 30.00, 50.00, 70.00, 100.00)
ON CONFLICT DO NOTHING;

-- Update existing products with default weight
UPDATE products SET weight_per_kg = 1.0 WHERE weight_per_kg IS NULL;

-- Create function to calculate shipping cost
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
  customer_state TEXT,
  customer_city TEXT,
  total_weight DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  shipping_config RECORD;
  is_local BOOLEAN;
  base_rate DECIMAL;
BEGIN
  -- Get shipping configuration
  SELECT * INTO shipping_config FROM shipping_rates LIMIT 1;
  
  -- Check if delivery is local (same state)
  is_local := (LOWER(customer_state) = LOWER(shipping_config.store_state));
  
  -- Calculate base rate (use average of min and max)
  IF is_local THEN
    base_rate := (shipping_config.local_rate_min + shipping_config.local_rate_max) / 2;
  ELSE
    base_rate := (shipping_config.interstate_rate_min + shipping_config.interstate_rate_max) / 2;
  END IF;
  
  -- Multiply by weight (rounded up to nearest kg)
  RETURN CEIL(total_weight) * base_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_shipping_cost IS 'Calculate shipping cost based on location and weight';

-- Allow public access to shipping_rates for reading
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shipping rates" ON shipping_rates
  FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can modify shipping rates" ON shipping_rates
  FOR ALL TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));