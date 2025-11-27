/*
# Add GST to Orders

## Changes
1. Add gst_amount column to orders table
2. Add gst_rate column to store the GST percentage (default 5%)

## Plain English Explanation
This migration adds GST (Goods and Services Tax) calculation to orders.
- gst_amount: The calculated GST amount (5% of subtotal)
- gst_rate: The GST percentage rate (default 5%)

## Notes
- GST is calculated as 5% of the subtotal (before shipping)
- The total_amount should include subtotal + gst_amount + shipping_cost
*/

-- Add GST columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS gst_rate numeric DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS gst_amount numeric DEFAULT 0;

-- Update existing orders to calculate GST (5% of subtotal)
UPDATE orders 
SET gst_amount = ROUND((total_amount - COALESCE(shipping_cost, 0)) * 0.05 / 1.05, 2),
    gst_rate = 5.0
WHERE gst_amount = 0 OR gst_amount IS NULL;
