/*
# Backfill Shipments for Existing Online Orders

## Purpose
Create shipment entries for all existing completed online orders that don't have shipments yet.

## Changes
1. Insert shipment records for completed online orders
2. Generate tracking numbers in format SHIP-{order_id_prefix}
3. Set initial status to 'pending'

## Notes
- Only affects orders with order_type = 'online'
- Only affects orders with status = 'completed'
- Only creates shipments if they don't already exist
- This is a one-time backfill operation
*/

-- Insert shipments for all completed online orders that don't have shipments
INSERT INTO shipments (order_id, tracking_number, status)
SELECT 
  o.id,
  'SHIP-' || UPPER(SUBSTRING(o.id::text, 1, 8)),
  'pending'::shipment_status
FROM orders o
WHERE o.order_type = 'online'::order_type
  AND o.status = 'completed'::order_status
  AND NOT EXISTS (
    SELECT 1 FROM shipments s WHERE s.order_id = o.id
  );
