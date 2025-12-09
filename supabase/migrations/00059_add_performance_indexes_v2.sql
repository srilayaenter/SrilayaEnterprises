-- ============================================================================
-- Performance Optimization Migration - Indexes and Monitoring
-- ============================================================================

-- Performance monitoring table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  recorded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at DESC);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_packaging_size ON product_variants(packaging_size);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Shipments indexes
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_handler_id ON shipments(handler_id);

-- Notifications indexes (column is 'read' not 'is_read')
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;

-- Function to record performance metric
CREATE OR REPLACE FUNCTION record_performance_metric(
  p_metric_type text,
  p_metric_name text,
  p_metric_value numeric,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_metric_id uuid;
BEGIN
  INSERT INTO performance_metrics (
    metric_type,
    metric_name,
    metric_value,
    metadata
  ) VALUES (
    p_metric_type,
    p_metric_name,
    p_metric_value,
    p_metadata
  ) RETURNING id INTO v_metric_id;
  
  RETURN v_metric_id;
END;
$$;

-- Function to get table sizes
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
  table_name text,
  row_count bigint,
  total_size text,
  table_size text,
  indexes_size text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname || '.' || tablename AS table_name,
    n_live_tup AS row_count,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename) - pg_relation_size(schemaname || '.' || tablename)) AS indexes_size
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
END;
$$;

-- Function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage()
RETURNS TABLE (
  table_name text,
  index_name text,
  index_scans bigint,
  rows_read bigint,
  index_size text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname || '.' || tablename AS table_name,
    indexrelname AS index_name,
    idx_scan AS index_scans,
    idx_tup_read AS rows_read,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC;
END;
$$;

-- Function to cleanup old performance metrics
CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM performance_metrics
  WHERE recorded_at < now() - interval '30 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- Enable RLS
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for performance_metrics
CREATE POLICY "Admins can view performance metrics"
  ON performance_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "System can insert performance metrics"
  ON performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);