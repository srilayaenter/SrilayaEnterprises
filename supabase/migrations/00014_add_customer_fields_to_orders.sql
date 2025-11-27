/*
# Add Customer Information Fields to Orders

## Changes
1. Add customer information fields to orders table
2. These fields store customer details collected during checkout

## Tables Modified
- `orders`: Add customer_name, customer_email, customer_phone, customer_city, customer_state

## Notes
- These fields are optional and can be null
- Used for guest checkout and order fulfillment
*/

-- Add customer information fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_city TEXT,
ADD COLUMN IF NOT EXISTS customer_state TEXT;
