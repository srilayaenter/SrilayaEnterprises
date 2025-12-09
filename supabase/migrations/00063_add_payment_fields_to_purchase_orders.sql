/*
# Add Payment Tracking Fields to Purchase Orders

## Purpose
Add payment method, payment date, and payment reference fields to purchase_orders table
to enable complete payment tracking for vendor/supplier payments.

## Changes
1. Add payment_method column (enum type)
2. Add payment_date column (date)
3. Add payment_reference column (text) - for transaction IDs, cheque numbers, etc.

## Notes
- payment_status already exists in the table
- payment_method is nullable (null when payment_status is 'pending')
- payment_date is nullable (null when payment_status is 'pending')
- payment_reference is nullable (optional field)
*/

-- Add payment_method column (using existing payment_method enum if it exists, or text)
DO $$
BEGIN
  -- Check if payment_method type exists, if not create it
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'upi', 'cheque', 'card');
  END IF;
END $$;

-- Add payment_method column to purchase_orders
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS payment_method payment_method;

-- Add payment_date column
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS payment_date date;

-- Add payment_reference column
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS payment_reference text;

-- Add index for payment queries
CREATE INDEX IF NOT EXISTS idx_purchase_orders_payment_date ON purchase_orders(payment_date DESC);

-- Add comment for documentation
COMMENT ON COLUMN purchase_orders.payment_method IS 'Method used for payment (cash, bank_transfer, upi, cheque, card)';
COMMENT ON COLUMN purchase_orders.payment_date IS 'Date when payment was made';
COMMENT ON COLUMN purchase_orders.payment_reference IS 'Payment reference number (transaction ID, cheque number, etc.)';
