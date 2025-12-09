/*
# Add Payment Status Column to Purchase Orders

## Purpose
Add the missing payment_status column to the purchase_orders table.
This column is essential for tracking payment status of purchase orders.

## Changes
1. Ensure payment_status enum type exists
2. Add payment_status column to purchase_orders table
3. Set default value to 'pending'
4. Add index for performance

## Notes
- This fixes the "could not find payment status column" error
- All existing purchase orders will have payment_status set to 'pending'
- The column is NOT NULL with a default value for data integrity
*/

-- Ensure payment_status enum type exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid');
  END IF;
END $$;

-- Add payment_status column to purchase_orders table
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS payment_status payment_status NOT NULL DEFAULT 'pending';

-- Add index for payment status queries
CREATE INDEX IF NOT EXISTS idx_purchase_orders_payment_status ON purchase_orders(payment_status);

-- Add comment for documentation
COMMENT ON COLUMN purchase_orders.payment_status IS 'Payment status of the purchase order (pending, partial, paid)';