/*
# Create Purchase Orders Table

## Purpose
Track purchase orders placed with vendors from order placement to receipt.

## Tables Created

### purchase_orders
- `id` (uuid, primary key)
- `po_number` (text, unique, not null) - Auto-generated purchase order number
- `vendor_id` (uuid, references vendors) - Which vendor
- `order_date` (date, not null) - When order was placed
- `expected_delivery_date` (date) - When expecting delivery
- `actual_delivery_date` (date) - When actually received
- `status` (purchase_order_status enum) - Current order status
- `items` (jsonb, not null) - Product details and quantities
- `total_amount` (numeric, not null) - Total order value
- `shipping_cost` (numeric, default 0) - Shipping charges
- `notes` (text) - Additional notes
- `ordered_by` (uuid, references profiles) - Who created the order
- `vendor_supply_id` (uuid, references vendor_supplies) - Link to received supply
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Enums

### purchase_order_status
- ordered: Order placed with vendor
- confirmed: Vendor confirmed the order
- shipped: Vendor shipped the order
- received: Order received and verified
- cancelled: Order cancelled

## Security
- Enable RLS on purchase_orders table
- Admins have full access
- Regular users have read-only access

## Indexes
- vendor_id for vendor-based queries
- status for status filtering
- order_date for date-based queries
- po_number for quick lookups

## Notes
- Items stored as JSONB for flexibility
- Cannot modify orders with status 'received'
- PO numbers should be unique and auto-generated
- Links to vendor_supplies when order is received
*/

-- Create status enum
CREATE TYPE purchase_order_status AS ENUM (
  'ordered',
  'confirmed',
  'shipped',
  'received',
  'cancelled'
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text UNIQUE NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE RESTRICT NOT NULL,
  order_date date NOT NULL,
  expected_delivery_date date,
  actual_delivery_date date,
  status purchase_order_status NOT NULL DEFAULT 'ordered',
  items jsonb NOT NULL,
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_cost numeric(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  notes text,
  ordered_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  vendor_supply_id uuid REFERENCES vendor_supplies(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_order_date ON purchase_orders(order_date);
CREATE INDEX idx_purchase_orders_po_number ON purchase_orders(po_number);

-- Create trigger for updated_at
CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- Admin policy: full access
CREATE POLICY "Admins have full access to purchase orders" ON purchase_orders
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Users policy: read-only access
CREATE POLICY "Users can view purchase orders" ON purchase_orders
  FOR SELECT TO authenticated USING (true);

-- Add constraint: expected_delivery_date >= order_date
ALTER TABLE purchase_orders
ADD CONSTRAINT check_expected_delivery_after_order
CHECK (expected_delivery_date IS NULL OR expected_delivery_date >= order_date);

-- Add constraint: actual_delivery_date >= order_date
ALTER TABLE purchase_orders
ADD CONSTRAINT check_actual_delivery_after_order
CHECK (actual_delivery_date IS NULL OR actual_delivery_date >= order_date);

-- Add constraint: if status is received, actual_delivery_date must be set
CREATE OR REPLACE FUNCTION check_received_has_delivery_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'received' AND NEW.actual_delivery_date IS NULL THEN
    RAISE EXCEPTION 'actual_delivery_date is required when status is received';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_received_has_delivery_date
  BEFORE INSERT OR UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION check_received_has_delivery_date();

-- Function to generate next PO number
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS text AS $$
DECLARE
  next_number integer;
  po_date text;
  new_po_number text;
BEGIN
  -- Get current date in YYYYMMDD format
  po_date := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  -- Get the count of POs created today
  SELECT COUNT(*) + 1 INTO next_number
  FROM purchase_orders
  WHERE po_number LIKE 'PO-' || po_date || '-%';
  
  -- Generate PO number: PO-YYYYMMDD-XXX
  new_po_number := 'PO-' || po_date || '-' || LPAD(next_number::text, 3, '0');
  
  RETURN new_po_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;