/*
# Add Paid Amount Field for Partial Payment Tracking

## Purpose
Add paid_amount field to purchase_orders table to track partial payments.
When payment_status is 'partial', this field stores how much has been paid,
and the pending amount can be calculated as (total_amount - paid_amount).

## Changes
1. Add paid_amount column (numeric) to purchase_orders table
2. Add check constraint to ensure paid_amount <= total_amount
3. Add check constraint to ensure paid_amount >= 0

## Business Logic
- When payment_status = 'pending': paid_amount = 0 or NULL
- When payment_status = 'partial': 0 < paid_amount < total_amount
- When payment_status = 'paid': paid_amount = total_amount
- Pending amount = total_amount - paid_amount

## Notes
- paid_amount is nullable (NULL treated as 0)
- Default value is 0
- Must be less than or equal to total_amount
- Must be greater than or equal to 0
*/

-- Add paid_amount column to purchase_orders
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS paid_amount numeric(10, 2) DEFAULT 0 CHECK (paid_amount >= 0);

-- Add check constraint to ensure paid_amount doesn't exceed total_amount
ALTER TABLE purchase_orders
ADD CONSTRAINT check_paid_amount_not_exceeds_total 
CHECK (paid_amount <= total_amount);

-- Add index for payment amount queries
CREATE INDEX IF NOT EXISTS idx_purchase_orders_paid_amount ON purchase_orders(paid_amount);

-- Add comment for documentation
COMMENT ON COLUMN purchase_orders.paid_amount IS 'Amount that has been paid. For partial payments, pending = total_amount - paid_amount';

-- Update existing records: set paid_amount based on payment_status
UPDATE purchase_orders
SET paid_amount = CASE 
  WHEN payment_status = 'paid' THEN total_amount
  WHEN payment_status = 'partial' THEN 0  -- Will be updated manually
  ELSE 0
END
WHERE paid_amount IS NULL;
