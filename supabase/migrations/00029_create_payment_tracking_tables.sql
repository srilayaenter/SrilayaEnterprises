/*
# Create Payment Tracking Tables

## Purpose
Track payments made to shipment handlers and vendors/suppliers to manage business expenses.

## Tables Created

### 1. handler_payments
Tracks payments made to shipment handlers for delivery services.

**Columns:**
- `id` (uuid, primary key) - Unique payment identifier
- `handler_id` (uuid, foreign key) - References shipment_handlers table
- `shipment_id` (uuid, foreign key, nullable) - Optional reference to specific shipment
- `amount` (numeric, not null) - Payment amount
- `payment_date` (date, not null) - Date payment was made
- `payment_method` (enum, not null) - How payment was made
- `reference_number` (text, nullable) - Transaction reference (e.g., UPI ID, cheque number)
- `notes` (text, nullable) - Additional payment notes
- `created_at` (timestamptz) - Record creation timestamp
- `updated_at` (timestamptz) - Record update timestamp

### 2. vendor_payments
Tracks payments made to product vendors/suppliers for inventory purchases.

**Columns:**
- `id` (uuid, primary key) - Unique payment identifier
- `vendor_name` (text, not null) - Name of vendor/supplier
- `vendor_contact` (text, nullable) - Vendor phone/email
- `amount` (numeric, not null) - Payment amount
- `payment_date` (date, not null) - Date payment was made
- `payment_method` (enum, not null) - How payment was made
- `reference_number` (text, nullable) - Transaction reference
- `purpose` (text, nullable) - What was purchased (e.g., "Rice - 100kg")
- `notes` (text, nullable) - Additional payment notes
- `created_at` (timestamptz) - Record creation timestamp
- `updated_at` (timestamptz) - Record update timestamp

## Security
- RLS enabled on both tables
- Admins have full access
- Regular users have no access (admin-only feature)

## Enums
- payment_method: cash, bank_transfer, upi, cheque
*/

-- Create payment method enum
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'upi', 'cheque');

-- Create handler_payments table
CREATE TABLE IF NOT EXISTS handler_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handler_id uuid NOT NULL REFERENCES shipment_handlers(id) ON DELETE CASCADE,
  shipment_id uuid REFERENCES shipments(id) ON DELETE SET NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL,
  payment_method payment_method NOT NULL,
  reference_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vendor_payments table
CREATE TABLE IF NOT EXISTS vendor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name text NOT NULL,
  vendor_contact text,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL,
  payment_method payment_method NOT NULL,
  reference_number text,
  purpose text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_handler_payments_handler_id ON handler_payments(handler_id);
CREATE INDEX idx_handler_payments_shipment_id ON handler_payments(shipment_id);
CREATE INDEX idx_handler_payments_payment_date ON handler_payments(payment_date DESC);
CREATE INDEX idx_vendor_payments_vendor_name ON vendor_payments(vendor_name);
CREATE INDEX idx_vendor_payments_payment_date ON vendor_payments(payment_date DESC);

-- Add updated_at trigger for handler_payments
CREATE TRIGGER update_handler_payments_updated_at
  BEFORE UPDATE ON handler_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for vendor_payments
CREATE TRIGGER update_vendor_payments_updated_at
  BEFORE UPDATE ON vendor_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE handler_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin-only access
CREATE POLICY "Admins have full access to handler payments" ON handler_payments
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Admins have full access to vendor payments" ON vendor_payments
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Create views for payment summaries
CREATE VIEW handler_payment_summary AS
SELECT 
  h.id as handler_id,
  h.name as handler_name,
  h.service_type,
  COUNT(hp.id) as total_payments,
  COALESCE(SUM(hp.amount), 0) as total_amount_paid,
  MAX(hp.payment_date) as last_payment_date
FROM shipment_handlers h
LEFT JOIN handler_payments hp ON h.id = hp.handler_id
GROUP BY h.id, h.name, h.service_type;

CREATE VIEW vendor_payment_summary AS
SELECT 
  vendor_name,
  vendor_contact,
  COUNT(id) as total_payments,
  SUM(amount) as total_amount_paid,
  MAX(payment_date) as last_payment_date
FROM vendor_payments
GROUP BY vendor_name, vendor_contact;
