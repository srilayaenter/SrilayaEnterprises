/*
# Add Shipment Date Validation

## Purpose
Ensure shipment dates are logically valid - a shipment cannot be shipped before the order was created.

## Changes
1. Add check constraint to validate shipped_date >= order created_at date
2. Fix existing invalid dates by setting them to the order created date

## Validation Rule
- shipped_date must be >= the date portion of the order's created_at timestamp
- This prevents data entry errors where shipment dates are set before order dates

## Data Cleanup
- Update any existing shipments with invalid dates to use the order's created date
*/

-- First, fix existing invalid dates
UPDATE shipments s
SET shipped_date = o.created_at::date
FROM orders o
WHERE s.order_id = o.id
  AND s.shipped_date IS NOT NULL
  AND s.shipped_date < o.created_at::date;

-- Add a check constraint to prevent future invalid dates
-- Note: We can't directly reference the orders table in a CHECK constraint
-- So we'll use a trigger function instead

CREATE OR REPLACE FUNCTION validate_shipment_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  order_created_date date;
BEGIN
  -- Only validate if shipped_date is being set
  IF NEW.shipped_date IS NOT NULL THEN
    -- Get the order's created date
    SELECT created_at::date INTO order_created_date
    FROM orders
    WHERE id = NEW.order_id;
    
    -- Check if shipment date is before order date
    IF NEW.shipped_date < order_created_date THEN
      RAISE EXCEPTION 'Shipment date (%) cannot be before order date (%)', 
        NEW.shipped_date, order_created_date;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate dates on INSERT and UPDATE
DROP TRIGGER IF EXISTS validate_shipment_date_trigger ON shipments;

CREATE TRIGGER validate_shipment_date_trigger
  BEFORE INSERT OR UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION validate_shipment_date();

-- Also validate expected_delivery_date is after shipped_date
CREATE OR REPLACE FUNCTION validate_delivery_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only validate if both dates are set
  IF NEW.shipped_date IS NOT NULL AND NEW.expected_delivery_date IS NOT NULL THEN
    -- Check if expected delivery is before shipped date
    IF NEW.expected_delivery_date < NEW.shipped_date THEN
      RAISE EXCEPTION 'Expected delivery date (%) cannot be before shipped date (%)', 
        NEW.expected_delivery_date, NEW.shipped_date;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate delivery dates
DROP TRIGGER IF EXISTS validate_delivery_date_trigger ON shipments;

CREATE TRIGGER validate_delivery_date_trigger
  BEFORE INSERT OR UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION validate_delivery_date();
