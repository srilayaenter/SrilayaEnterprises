/*
# Create Vendor Payments Table

## Purpose
Track payments made to product vendors/suppliers for inventory purchases.

## Table Created

### vendor_payments
Tracks payments made to product vendors/suppliers.

**Columns:**
- `id` (uuid, primary key) - Unique payment identifier
- `vendor_name` (text, not null) - Name of vendor/supplier
- `vendor_contact` (text, nullable) - Vendor phone/email
- `amount` (numeric, not null) - Payment amount
- `payment_date` (date, not null) - Date payment was made
- `payment_method` (enum, not null) - How payment was made (cash, bank_transfer, upi, cheque, card)
- `reference_number` (text, nullable) - Transaction reference
- `purpose` (text, nullable) - What was purchased (e.g., "Rice - 100kg")
- `notes` (text, nullable) - Additional payment notes
- `created_at` (timestamptz) - Record creation timestamp
- `updated_at` (timestamptz) - Record update timestamp

## Security
- RLS enabled
- Admins have full access
- Regular users have no access (admin-only feature)
*/

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
CREATE INDEX idx_vendor_payments_vendor_name ON vendor_payments(vendor_name);
CREATE INDEX idx_vendor_payments_payment_date ON vendor_payments(payment_date DESC);

-- Add updated_at trigger
CREATE TRIGGER update_vendor_payments_updated_at
  BEFORE UPDATE ON vendor_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin-only access
CREATE POLICY "Admins have full access to vendor payments" ON vendor_payments
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Create view for payment summary
CREATE VIEW vendor_payment_summary AS
SELECT 
  vendor_name,
  vendor_contact,
  COUNT(id) as total_payments,
  SUM(amount) as total_amount_paid,
  MAX(payment_date) as last_payment_date
FROM vendor_payments
GROUP BY vendor_name, vendor_contact;
