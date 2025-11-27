/*
# Create handler_payments table

This migration creates a table to track payments made to shipment handlers for their delivery services.

## 1. New Tables

### `handler_payments`
Stores payment records for shipment handlers.

**Columns:**
- `id` (uuid, primary key) - Unique payment record identifier
- `shipment_id` (uuid, references shipments) - The shipment this payment is for
- `handler_id` (uuid, references shipment_handlers) - The handler receiving payment
- `order_id` (uuid, references orders) - The order associated with this shipment
- `payment_amount` (numeric) - Amount paid to handler
- `payment_date` (date) - Date payment was made
- `payment_method` (text) - Method of payment (cash, bank transfer, UPI, etc.)
- `payment_status` (payment_status enum) - Status: pending, partial, paid
- `transaction_reference` (text) - Bank transaction ID or reference number
- `notes` (text) - Additional payment notes
- `created_at` (timestamptz) - Record creation timestamp
- `updated_at` (timestamptz) - Last update timestamp

## 2. Security

- Enable RLS on `handler_payments` table
- Admin-only access for all operations (using existing is_admin function)
- No public access to payment records

## 3. Indexes

- Index on `shipment_id` for fast shipment payment lookups
- Index on `handler_id` for handler payment history
- Index on `payment_status` for filtering pending payments
- Index on `payment_date` for date-based queries

## 4. Triggers

- Automatic `updated_at` timestamp update on record modification
*/

-- Create handler_payments table
CREATE TABLE IF NOT EXISTS handler_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES shipments(id) ON DELETE CASCADE,
  handler_id uuid REFERENCES shipment_handlers(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  payment_amount numeric NOT NULL DEFAULT 0,
  payment_date date,
  payment_method text,
  payment_status payment_status NOT NULL DEFAULT 'pending'::payment_status,
  transaction_reference text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE handler_payments ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admins have full access to handler payments" ON handler_payments
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_handler_payments_shipment ON handler_payments(shipment_id);
CREATE INDEX idx_handler_payments_handler ON handler_payments(handler_id);
CREATE INDEX idx_handler_payments_order ON handler_payments(order_id);
CREATE INDEX idx_handler_payments_status ON handler_payments(payment_status);
CREATE INDEX idx_handler_payments_date ON handler_payments(payment_date);

-- Add updated_at trigger
CREATE TRIGGER update_handler_payments_updated_at
  BEFORE UPDATE ON handler_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE handler_payments IS 'Tracks payments made to shipment handlers for delivery services';
