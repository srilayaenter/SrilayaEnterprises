-- Add vendor_id to products table to link products with vendors
ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);

-- Add purchase_order_id to vendor_payments to link payments with purchase orders
ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS purchase_order_id uuid REFERENCES purchase_orders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_vendor_payments_po_id ON vendor_payments(purchase_order_id);

-- Add vendor_id to vendor_payments for easier querying
ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES vendors(id) ON DELETE RESTRICT;