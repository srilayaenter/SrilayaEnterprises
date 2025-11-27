/*
# Vendor and Shipping Management System

## Overview
This migration creates comprehensive vendor and shipping management functionality for Srilaya Enterprises.

## 1. New Tables

### vendors
Stores supplier/vendor information
- `id` (uuid, primary key)
- `name` (text, required) - Vendor company name
- `contact_person` (text) - Primary contact name
- `email` (text) - Contact email
- `phone` (text) - Contact phone
- `address` (text) - Vendor address
- `gstin` (text) - GST identification number
- `payment_terms` (text) - Payment terms (e.g., "Net 30")
- `status` (text) - active/inactive
- `notes` (text) - Additional notes
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### vendor_transactions
Records purchase transactions with vendors
- `id` (uuid, primary key)
- `vendor_id` (uuid, references vendors)
- `transaction_type` (text) - purchase/payment/return
- `amount` (decimal) - Transaction amount
- `payment_method` (text) - cash/bank_transfer/cheque/upi
- `reference_number` (text) - Invoice/receipt number
- `description` (text) - Transaction details
- `transaction_date` (date)
- `created_at` (timestamptz)

### shipment_handlers
Stores logistics partner information
- `id` (uuid, primary key)
- `name` (text, required) - Handler company name
- `contact_person` (text)
- `email` (text)
- `phone` (text)
- `service_type` (text) - courier/freight/local_delivery
- `coverage_area` (text) - Service coverage
- `status` (text) - active/inactive
- `notes` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### shipment_handler_transactions
Records payments to shipping handlers
- `id` (uuid, primary key)
- `handler_id` (uuid, references shipment_handlers)
- `amount` (decimal)
- `payment_method` (text)
- `reference_number` (text)
- `description` (text)
- `transaction_date` (date)
- `created_at` (timestamptz)

### shipments
Detailed shipment tracking
- `id` (uuid, primary key)
- `order_id` (uuid, references orders)
- `handler_id` (uuid, references shipment_handlers)
- `tracking_number` (text, unique)
- `status` (text) - pending/picked_up/in_transit/out_for_delivery/delivered/returned/cancelled
- `shipped_date` (timestamptz)
- `expected_delivery_date` (date)
- `actual_delivery_date` (timestamptz)
- `return_reason` (text) - Reason if returned
- `notes` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## 2. Security
- Enable RLS on all tables
- Admin full access to all tables
- Customers can view their own shipment status

## 3. Indexes
- Create indexes on foreign keys for performance
- Index on tracking_number for quick lookups
*/

-- Create ENUM types
CREATE TYPE vendor_status AS ENUM ('active', 'inactive');
CREATE TYPE transaction_type AS ENUM ('purchase', 'payment', 'return');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'cheque', 'upi', 'card');
CREATE TYPE service_type AS ENUM ('courier', 'freight', 'local_delivery');
CREATE TYPE shipment_status AS ENUM ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled');

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  gstin text,
  payment_terms text DEFAULT 'Net 30',
  status vendor_status DEFAULT 'active'::vendor_status NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendor transactions table
CREATE TABLE IF NOT EXISTS vendor_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  amount decimal(10, 2) NOT NULL,
  payment_method payment_method,
  reference_number text,
  description text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Shipment handlers table
CREATE TABLE IF NOT EXISTS shipment_handlers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  service_type service_type NOT NULL,
  coverage_area text,
  status vendor_status DEFAULT 'active'::vendor_status NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipment handler transactions table
CREATE TABLE IF NOT EXISTS shipment_handler_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handler_id uuid NOT NULL REFERENCES shipment_handlers(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  payment_method payment_method,
  reference_number text,
  description text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  handler_id uuid REFERENCES shipment_handlers(id),
  tracking_number text UNIQUE,
  status shipment_status DEFAULT 'pending'::shipment_status NOT NULL,
  shipped_date timestamptz,
  expected_delivery_date date,
  actual_delivery_date timestamptz,
  return_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_vendor_transactions_vendor_id ON vendor_transactions(vendor_id);
CREATE INDEX idx_vendor_transactions_date ON vendor_transactions(transaction_date DESC);
CREATE INDEX idx_shipment_handler_transactions_handler_id ON shipment_handler_transactions(handler_id);
CREATE INDEX idx_shipment_handler_transactions_date ON shipment_handler_transactions(transaction_date DESC);
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_handler_id ON shipments(handler_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_handlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_handler_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors
CREATE POLICY "Admins have full access to vendors" ON vendors
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies for vendor_transactions
CREATE POLICY "Admins have full access to vendor_transactions" ON vendor_transactions
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies for shipment_handlers
CREATE POLICY "Admins have full access to shipment_handlers" ON shipment_handlers
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies for shipment_handler_transactions
CREATE POLICY "Admins have full access to shipment_handler_transactions" ON shipment_handler_transactions
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- RLS Policies for shipments
CREATE POLICY "Admins have full access to shipments" ON shipments
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own shipments" ON shipments
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = shipments.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipment_handlers_updated_at BEFORE UPDATE ON shipment_handlers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update order status when shipment status changes
CREATE OR REPLACE FUNCTION update_order_status_from_shipment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update order status based on shipment status
  IF NEW.status = 'delivered' THEN
    UPDATE orders SET status = 'delivered' WHERE id = NEW.order_id;
  ELSIF NEW.status = 'returned' THEN
    UPDATE orders SET status = 'cancelled' WHERE id = NEW.order_id;
  ELSIF NEW.status IN ('picked_up', 'in_transit', 'out_for_delivery') THEN
    UPDATE orders SET status = 'shipped' WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync order status with shipment status
CREATE TRIGGER sync_order_status_with_shipment
  AFTER INSERT OR UPDATE OF status ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_order_status_from_shipment();