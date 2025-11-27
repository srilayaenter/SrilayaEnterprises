/*
# Add Order Type to Orders Table

## Purpose
Differentiate between online orders and in-store purchases to handle different fulfillment workflows.

## Changes

1. **New Enum Type**
   - `order_type`: 'online' | 'instore'

2. **Table Modifications**
   - Add `order_type` column to `orders` table
   - Default value: 'online' (for backward compatibility)
   - Make shipping_address_id nullable (not required for in-store)

3. **Business Logic**
   - **Online Orders**: Require shipping address, create shipment, track delivery
   - **In-Store Purchases**: No shipping needed, direct pickup at store
   - Status flow differs:
     * In-store: pending → processing → completed
     * Online: pending → processing → shipped → delivered

4. **Notes**
   - Existing orders will be marked as 'online' by default
   - In-store orders can have NULL shipping_address_id
   - Shipment tracking only applies to online orders
*/

-- Create order_type enum
CREATE TYPE order_type AS ENUM ('online', 'instore');

-- Add order_type column to orders table
ALTER TABLE orders 
ADD COLUMN order_type order_type DEFAULT 'online'::order_type NOT NULL;

-- Make shipping_address_id nullable for in-store orders
ALTER TABLE orders 
ALTER COLUMN shipping_address_id DROP NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN orders.order_type IS 'Type of order: online (requires shipping) or instore (direct purchase at store)';
COMMENT ON COLUMN orders.shipping_address_id IS 'Shipping address (required for online orders, NULL for in-store purchases)';

-- Create index for filtering by order type
CREATE INDEX idx_orders_order_type ON orders(order_type);

-- Create index for combined filtering
CREATE INDEX idx_orders_type_status ON orders(order_type, status);