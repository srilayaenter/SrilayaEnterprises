-- Create ENUM type for delivery status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_status') THEN
        CREATE TYPE delivery_status AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled');
    END IF;
END $$;

-- Add vendor_id to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL;

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  order_number text UNIQUE NOT NULL,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date date,
  actual_delivery_date date,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  delivery_status delivery_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price numeric(10,2) NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create vendor_payments table
CREATE TABLE IF NOT EXISTS vendor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  purchase_order_id uuid REFERENCES purchase_orders(id) ON DELETE SET NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL,
  reference_number text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_date ON purchase_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_delivery_status ON purchase_orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_payment_status ON purchase_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON purchase_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor_id ON vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_po_id ON vendor_payments(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_payment_date ON vendor_payments(payment_date DESC);