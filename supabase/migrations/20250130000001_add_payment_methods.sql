/*
# Add Payment Methods to Orders

## Plain English Explanation
This migration adds support for multiple payment methods (cash, UPI, card, split payment) 
for in-store purchases. It adds two new columns to the orders table:
- payment_method: stores the payment method used (cash, upi, card, split)
- payment_details: stores additional payment information (e.g., split payment breakdown)

## Changes
1. Add payment_method column to orders table
2. Add payment_details JSONB column for storing split payment details

## Notes
- This enables in-store purchases with cash, UPI, and split payments
- Online orders will continue to use Stripe (card payments)
*/

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_details jsonb;

COMMENT ON COLUMN orders.payment_method IS 'Payment method used: cash, upi, card, or split';
COMMENT ON COLUMN orders.payment_details IS 'Additional payment details (e.g., split payment breakdown)';
