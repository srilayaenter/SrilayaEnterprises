/*
# Create Shipments for Existing Online Orders

## Overview
This migration creates shipment entries for all existing online orders that don't have shipments yet.

## What It Does
1. Finds all orders with order_type = 'online' that don't have a shipment
2. Creates a shipment entry for each order
3. Sets initial status to 'pending'
4. Generates tracking numbers

## Tables Affected
- shipments (INSERT)

## Security
- Uses existing RLS policies
- No policy changes needed
*/

-- Create shipments for all existing online orders that don't have shipments
INSERT INTO shipments (order_id, status, tracking_number)
SELECT 
  o.id as order_id,
  'pending'::shipment_status as status,
  'SHIP-' || UPPER(SUBSTRING(o.id::text, 1, 8)) as tracking_number
FROM orders o
WHERE o.order_type = 'online'
  AND NOT EXISTS (
    SELECT 1 FROM shipments s WHERE s.order_id = o.id
  );

-- Log the number of shipments created
DO $$
DECLARE
  shipment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO shipment_count FROM shipments;
  RAISE NOTICE 'Total shipments in database: %', shipment_count;
END $$;
