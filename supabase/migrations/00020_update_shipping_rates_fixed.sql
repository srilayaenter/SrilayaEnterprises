/*
# Update Shipping Rates to Fixed Values

## Changes
1. Update shipping rates to fixed values:
   - Intrastate (same state): ₹30 per kg
   - Interstate (different state): ₹70 per kg
2. Update the calculate_shipping_cost function to use exact rates

## Rates
- **Intrastate**: ₹30/kg (same city and state)
- **Interstate**: ₹70/kg (different state)

## Notes
- Removed rate ranges, now using fixed rates
- Simplified calculation logic
- Weight is rounded up to nearest kg (CEIL function)
*/

-- Update shipping rates table to use fixed rates
UPDATE shipping_rates
SET 
  local_rate_min = 30.00,
  local_rate_max = 30.00,
  interstate_rate_min = 70.00,
  interstate_rate_max = 70.00,
  updated_at = NOW();

-- Drop and recreate the shipping calculation function with fixed rates
DROP FUNCTION IF EXISTS calculate_shipping_cost(TEXT, TEXT, NUMERIC);

CREATE FUNCTION calculate_shipping_cost(
  p_customer_state TEXT,
  p_customer_city TEXT,
  p_total_weight NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  v_config RECORD;
  v_is_intrastate BOOLEAN;
  v_rate_per_kg NUMERIC;
  v_weight_kg NUMERIC;
BEGIN
  -- Get shipping configuration
  SELECT * INTO v_config FROM shipping_rates LIMIT 1;
  
  -- Check if delivery is intrastate (same state)
  v_is_intrastate := (LOWER(TRIM(COALESCE(p_customer_state, ''))) = LOWER(TRIM(v_config.store_state)));
  
  -- Set rate based on delivery type
  IF v_is_intrastate THEN
    v_rate_per_kg := 30.00;  -- Intrastate rate: ₹30/kg
  ELSE
    v_rate_per_kg := 70.00;  -- Interstate rate: ₹70/kg
  END IF;
  
  -- Round up weight to nearest kg
  v_weight_kg := CEIL(p_total_weight);
  
  -- Calculate total shipping cost
  RETURN v_weight_kg * v_rate_per_kg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_shipping_cost IS 'Calculate shipping cost: ₹30/kg for intrastate, ₹70/kg for interstate';

-- Add helpful comments
COMMENT ON COLUMN shipping_rates.local_rate_min IS 'Intrastate shipping rate per kg (fixed at ₹30)';
COMMENT ON COLUMN shipping_rates.local_rate_max IS 'Intrastate shipping rate per kg (fixed at ₹30)';
COMMENT ON COLUMN shipping_rates.interstate_rate_min IS 'Interstate shipping rate per kg (fixed at ₹70)';
COMMENT ON COLUMN shipping_rates.interstate_rate_max IS 'Interstate shipping rate per kg (fixed at ₹70)';