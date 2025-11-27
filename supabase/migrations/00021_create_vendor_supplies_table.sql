/*
# Vendor Supplies Tracking System

## Overview
This migration creates a comprehensive system to track all supplies/deliveries from vendors.
Admin can record details of each supply including products, quantities, costs, and quality checks.

## 1. New Table: vendor_supplies

### Purpose
Track all inventory supplies received from vendors with complete details.

### Fields
- `id` (uuid, primary key) - Unique identifier
- `vendor_id` (uuid, references vendors) - Which vendor supplied the items
- `supply_date` (date) - Date when supply was received
- `invoice_number` (text) - Vendor's invoice/bill number
- `items` (jsonb) - Array of items supplied with details:
  - product_id: UUID of the product
  - product_name: Name of the product
  - variant_id: UUID of the variant (if applicable)
  - packaging_size: Size of packaging (1kg, 2kg, etc.)
  - quantity: Number of units supplied
  - unit_cost: Cost per unit in rupees
  - total_cost: Total cost for this item
- `total_amount` (decimal) - Total invoice amount in rupees
- `payment_status` (text) - pending/partial/paid
- `payment_date` (date) - Date when payment was made
- `quality_check_status` (text) - pending/passed/failed
- `quality_notes` (text) - Notes from quality inspection
- `delivery_notes` (text) - General notes about the delivery
- `received_by` (uuid, references profiles) - Admin who received the supply
- `created_at` (timestamptz) - Record creation timestamp
- `updated_at` (timestamptz) - Last update timestamp

## 2. Security
- Enable RLS on vendor_supplies table
- Only admins can view and manage vendor supplies
- All operations require admin authentication

## 3. Indexes
- Index on vendor_id for quick vendor-wise filtering
- Index on supply_date for date-based queries
- Index on payment_status for filtering unpaid supplies
- Index on quality_check_status for quality tracking

## 4. Benefits
- Complete audit trail of all supplies
- Track payment status for each supply
- Quality control tracking
- Easy reconciliation with vendor invoices
- Inventory management support
*/

-- Create ENUM types for vendor supplies
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid');
CREATE TYPE quality_check_status AS ENUM ('pending', 'passed', 'failed');

-- Create vendor_supplies table
CREATE TABLE IF NOT EXISTS vendor_supplies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  supply_date date NOT NULL DEFAULT CURRENT_DATE,
  invoice_number text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount decimal(12, 2) NOT NULL DEFAULT 0,
  payment_status payment_status DEFAULT 'pending'::payment_status NOT NULL,
  payment_date date,
  quality_check_status quality_check_status DEFAULT 'pending'::quality_check_status NOT NULL,
  quality_notes text,
  delivery_notes text,
  received_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT positive_total_amount CHECK (total_amount >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_vendor_supplies_vendor_id ON vendor_supplies(vendor_id);
CREATE INDEX idx_vendor_supplies_supply_date ON vendor_supplies(supply_date DESC);
CREATE INDEX idx_vendor_supplies_payment_status ON vendor_supplies(payment_status);
CREATE INDEX idx_vendor_supplies_quality_status ON vendor_supplies(quality_check_status);
CREATE INDEX idx_vendor_supplies_received_by ON vendor_supplies(received_by);

-- Enable RLS
ALTER TABLE vendor_supplies ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can access vendor supplies
CREATE POLICY "Admins have full access to vendor_supplies" ON vendor_supplies
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Trigger for updated_at timestamp
CREATE TRIGGER update_vendor_supplies_updated_at BEFORE UPDATE ON vendor_supplies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE vendor_supplies IS 'Tracks all inventory supplies received from vendors';
COMMENT ON COLUMN vendor_supplies.items IS 'JSONB array of supplied items with product details, quantities, and costs';
COMMENT ON COLUMN vendor_supplies.total_amount IS 'Total invoice amount in rupees';
COMMENT ON COLUMN vendor_supplies.payment_status IS 'Payment status: pending, partial, or paid';
COMMENT ON COLUMN vendor_supplies.quality_check_status IS 'Quality inspection status: pending, passed, or failed';