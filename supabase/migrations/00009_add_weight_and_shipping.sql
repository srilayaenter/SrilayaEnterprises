/*
# Add Weight Field and Shipping Configuration

## Plain English Explanation
This migration adds weight tracking for products and shipping cost configuration.

## Changes Made
1. Add weight_kg column to product_variants (weight in kilograms)
2. Add shipping_cost column to orders
3. Create shipping_rates table for weight-based pricing

## Tables Modified
- product_variants: Added weight_kg field
- orders: Added shipping_cost field

## New Tables
- shipping_rates: Weight-based shipping cost configuration

## Security
- Public can view shipping rates
- Only admins can modify shipping rates
*/

-- Add weight to product variants
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS weight_kg numeric(10,3) DEFAULT 1.0 CHECK (weight_kg > 0);

COMMENT ON COLUMN product_variants.weight_kg IS 'Product weight in kilograms for shipping calculation';

-- Add shipping cost to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_cost numeric(10,2) DEFAULT 0 CHECK (shipping_cost >= 0);

COMMENT ON COLUMN orders.shipping_cost IS 'Calculated shipping cost based on total weight';

-- Create shipping rates table
CREATE TABLE IF NOT EXISTS shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_weight_kg numeric(10,3) NOT NULL CHECK (min_weight_kg >= 0),
  max_weight_kg numeric(10,3) NOT NULL CHECK (max_weight_kg > min_weight_kg),
  rate_per_kg numeric(10,2) NOT NULL CHECK (rate_per_kg >= 0),
  base_cost numeric(10,2) DEFAULT 0 CHECK (base_cost >= 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE shipping_rates IS 'Weight-based shipping cost configuration';

-- Enable RLS on shipping_rates
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

-- Anyone can view shipping rates
CREATE POLICY "Anyone can view shipping rates" ON shipping_rates
  FOR SELECT USING (is_active = true);

-- Only admins can manage shipping rates
CREATE POLICY "Admins can manage shipping rates" ON shipping_rates
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- Insert default shipping rates (India standard rates)
INSERT INTO shipping_rates (min_weight_kg, max_weight_kg, rate_per_kg, base_cost) VALUES
  (0, 1, 50, 40),      -- 0-1kg: ₹40 base + ₹50/kg
  (1, 5, 40, 50),      -- 1-5kg: ₹50 base + ₹40/kg
  (5, 10, 35, 60),     -- 5-10kg: ₹60 base + ₹35/kg
  (10, 20, 30, 80),    -- 10-20kg: ₹80 base + ₹30/kg
  (20, 999, 25, 100);  -- 20kg+: ₹100 base + ₹25/kg

-- Update existing product variants with default weights based on packaging size
UPDATE product_variants
SET weight_kg = CASE 
  WHEN packaging_size = '250g' THEN 0.25
  WHEN packaging_size = '500g' THEN 0.5
  WHEN packaging_size = '1kg' THEN 1.0
  WHEN packaging_size = '2kg' THEN 2.0
  WHEN packaging_size = '5kg' THEN 5.0
  WHEN packaging_size = '10kg' THEN 10.0
  ELSE 1.0
END
WHERE weight_kg IS NULL OR weight_kg = 1.0;

-- Create function to calculate shipping cost
CREATE OR REPLACE FUNCTION calculate_shipping_cost(total_weight numeric)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  shipping_cost numeric;
  rate_record shipping_rates%ROWTYPE;
BEGIN
  -- Find applicable shipping rate
  SELECT * INTO rate_record
  FROM shipping_rates
  WHERE total_weight >= min_weight_kg 
    AND total_weight < max_weight_kg
    AND is_active = true
  ORDER BY min_weight_kg DESC
  LIMIT 1;
  
  -- Calculate cost: base_cost + (weight * rate_per_kg)
  IF rate_record.id IS NOT NULL THEN
    shipping_cost := rate_record.base_cost + (total_weight * rate_record.rate_per_kg);
  ELSE
    -- Default fallback: ₹50 per kg
    shipping_cost := total_weight * 50;
  END IF;
  
  RETURN ROUND(shipping_cost, 2);
END;
$$;

COMMENT ON FUNCTION calculate_shipping_cost IS 'Calculate shipping cost based on total weight in kg';