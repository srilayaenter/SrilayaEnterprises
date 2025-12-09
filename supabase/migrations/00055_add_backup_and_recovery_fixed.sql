-- ============================================================================
-- Backup and Recovery System Migration
-- ============================================================================

-- Create backup_metadata table
CREATE TABLE IF NOT EXISTS backup_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_name text NOT NULL,
  backup_type text NOT NULL CHECK (backup_type IN ('full', 'incremental', 'manual')),
  backup_size_bytes bigint,
  backup_location text,
  backup_status text NOT NULL DEFAULT 'in_progress' CHECK (backup_status IN ('in_progress', 'completed', 'failed', 'verified')),
  tables_included text[],
  row_counts jsonb DEFAULT '{}'::jsonb,
  checksum text,
  error_message text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  verified_at timestamptz
);

-- Create backup_schedule table
CREATE TABLE IF NOT EXISTS backup_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_name text NOT NULL,
  backup_type text NOT NULL CHECK (backup_type IN ('full', 'incremental')),
  frequency text NOT NULL CHECK (frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
  time_of_day time,
  day_of_week integer CHECK (day_of_week BETWEEN 0 AND 6),
  day_of_month integer CHECK (day_of_month BETWEEN 1 AND 31),
  is_active boolean DEFAULT true,
  retention_days integer DEFAULT 30,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create backup_restore_history table
CREATE TABLE IF NOT EXISTS backup_restore_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id uuid REFERENCES backup_metadata(id) ON DELETE SET NULL,
  restore_type text NOT NULL CHECK (restore_type IN ('full', 'partial', 'point_in_time')),
  tables_restored text[],
  restore_status text NOT NULL DEFAULT 'in_progress' CHECK (restore_status IN ('in_progress', 'completed', 'failed')),
  rows_restored jsonb DEFAULT '{}'::jsonb,
  error_message text,
  restored_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_backup_metadata_created_at ON backup_metadata(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_metadata_backup_type ON backup_metadata(backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_metadata_backup_status ON backup_metadata(backup_status);
CREATE INDEX IF NOT EXISTS idx_backup_schedule_next_run_at ON backup_schedule(next_run_at);
CREATE INDEX IF NOT EXISTS idx_backup_schedule_is_active ON backup_schedule(is_active);
CREATE INDEX IF NOT EXISTS idx_backup_restore_history_backup_id ON backup_restore_history(backup_id);
CREATE INDEX IF NOT EXISTS idx_backup_restore_history_started_at ON backup_restore_history(started_at DESC);

-- Function to create backup metadata
CREATE OR REPLACE FUNCTION create_backup_metadata(
  p_backup_name text,
  p_backup_type text,
  p_created_by uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_backup_id uuid;
BEGIN
  INSERT INTO backup_metadata (
    backup_name,
    backup_type,
    backup_status,
    created_by
  ) VALUES (
    p_backup_name,
    p_backup_type,
    'in_progress',
    COALESCE(p_created_by, auth.uid())
  ) RETURNING id INTO v_backup_id;
  
  PERFORM log_security_event(
    COALESCE(p_created_by, auth.uid()),
    'backup_initiated',
    'Database backup initiated: ' || p_backup_name,
    NULL,
    NULL,
    jsonb_build_object('backup_id', v_backup_id, 'backup_type', p_backup_type)
  );
  
  RETURN v_backup_id;
END;
$$;

-- Function to update backup status
CREATE OR REPLACE FUNCTION update_backup_status(
  p_backup_id uuid,
  p_status text,
  p_backup_size bigint DEFAULT NULL,
  p_tables_included text[] DEFAULT NULL,
  p_row_counts jsonb DEFAULT NULL,
  p_checksum text DEFAULT NULL,
  p_error_message text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE backup_metadata
  SET
    backup_status = p_status,
    backup_size_bytes = COALESCE(p_backup_size, backup_size_bytes),
    tables_included = COALESCE(p_tables_included, tables_included),
    row_counts = COALESCE(p_row_counts, row_counts),
    checksum = COALESCE(p_checksum, checksum),
    error_message = p_error_message,
    completed_at = CASE WHEN p_status IN ('completed', 'failed') THEN now() ELSE completed_at END
  WHERE id = p_backup_id;
  
  PERFORM log_security_event(
    (SELECT created_by FROM backup_metadata WHERE id = p_backup_id),
    'backup_status_updated',
    'Backup status updated to: ' || p_status,
    NULL,
    NULL,
    jsonb_build_object('backup_id', p_backup_id, 'status', p_status)
  );
END;
$$;

-- Function to verify backup
CREATE OR REPLACE FUNCTION verify_backup(p_backup_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE backup_metadata
  SET verified_at = now()
  WHERE id = p_backup_id;
  
  PERFORM log_security_event(
    auth.uid(),
    'backup_verified',
    'Backup verification completed',
    NULL,
    NULL,
    jsonb_build_object('backup_id', p_backup_id)
  );
  
  RETURN true;
END;
$$;

-- Function to get database statistics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_object_agg(
    table_name,
    jsonb_build_object(
      'row_count', row_count,
      'total_size', total_size
    )
  ) INTO v_stats
  FROM (
    SELECT
      schemaname || '.' || tablename AS table_name,
      n_live_tup AS row_count,
      pg_total_relation_size(schemaname || '.' || tablename) AS total_size
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
  ) t;
  
  RETURN v_stats;
END;
$$;

-- Function to cleanup old backups
CREATE OR REPLACE FUNCTION cleanup_old_backups()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_deleted integer := 0;
  v_current_deleted integer;
  v_schedule record;
BEGIN
  FOR v_schedule IN
    SELECT id, retention_days
    FROM backup_schedule
    WHERE is_active = true
  LOOP
    DELETE FROM backup_metadata
    WHERE backup_type IN ('full', 'incremental')
    AND created_at < now() - (v_schedule.retention_days || ' days')::interval
    AND backup_status = 'completed';
    
    GET DIAGNOSTICS v_current_deleted = ROW_COUNT;
    v_total_deleted := v_total_deleted + v_current_deleted;
  END LOOP;
  
  PERFORM log_security_event(
    NULL,
    'backup_cleanup',
    'Old backups cleaned up',
    NULL,
    NULL,
    jsonb_build_object('deleted_count', v_total_deleted)
  );
  
  RETURN v_total_deleted;
END;
$$;

-- Enable RLS
ALTER TABLE backup_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_restore_history ENABLE ROW LEVEL SECURITY;

-- Policies for backup_metadata
CREATE POLICY "Admins can view all backups"
  ON backup_metadata FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Admins can create backups"
  ON backup_metadata FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Admins can update backups"
  ON backup_metadata FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

-- Policies for backup_schedule
CREATE POLICY "Admins can manage backup schedules"
  ON backup_schedule FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

-- Policies for backup_restore_history
CREATE POLICY "Admins can view restore history"
  ON backup_restore_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

CREATE POLICY "Admins can create restore records"
  ON backup_restore_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );