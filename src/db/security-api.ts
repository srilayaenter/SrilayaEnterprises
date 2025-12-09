import { supabase } from './supabase';
import type {
  SecurityAuditLog,
  LoginAttempt,
  AccountLockout,
  ActiveSession,
  BackupMetadata,
  BackupSchedule,
  BackupRestoreHistory,
  PerformanceMetric,
  TableSize,
  IndexUsage,
  DatabaseStats,
} from '@/types/types';

// ============================================================================
// SECURITY FUNCTIONS
// ============================================================================

export async function logSecurityEvent(
  userId: string | null,
  eventType: string,
  eventDescription: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, any>
) {
  const { data, error } = await supabase.rpc('log_security_event', {
    p_user_id: userId,
    p_event_type: eventType,
    p_event_description: eventDescription,
    p_ip_address: ipAddress || null,
    p_user_agent: userAgent || null,
    p_metadata: metadata || {},
  });

  if (error) throw error;
  return data;
}

export async function checkAccountLockout(email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_account_lockout', {
    p_email: email,
  });

  if (error) throw error;
  return data as boolean;
}

export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean,
  failureReason?: string
) {
  const { error } = await supabase.rpc('record_login_attempt', {
    p_email: email,
    p_ip_address: ipAddress,
    p_success: success,
    p_failure_reason: failureReason || null,
  });

  if (error) throw error;
}

export async function getFailedLoginCount(
  email: string,
  minutes: number = 15
): Promise<number> {
  const { data, error } = await supabase.rpc('get_failed_login_count', {
    p_email: email,
    p_minutes: minutes,
  });

  if (error) throw error;
  return data as number;
}

export async function getSecurityAuditLogs(
  userId?: string,
  limit: number = 50
): Promise<SecurityAuditLog[]> {
  let query = supabase
    .from('security_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getLoginAttempts(
  email?: string,
  limit: number = 50
): Promise<LoginAttempt[]> {
  let query = supabase
    .from('login_attempts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (email) {
    query = query.eq('email', email);
  }

  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getAccountLockouts(
  email?: string
): Promise<AccountLockout[]> {
  let query = supabase
    .from('account_lockouts')
    .select('*')
    .order('created_at', { ascending: false });

  if (email) {
    query = query.eq('email', email);
  }

  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getActiveSessions(
  userId?: string
): Promise<ActiveSession[]> {
  let query = supabase
    .from('active_sessions')
    .select('*')
    .order('last_activity', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function deleteSession(sessionId: string) {
  const { error } = await supabase
    .from('active_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
}

export async function cleanupOldSessions(): Promise<number> {
  const { data, error } = await supabase.rpc('cleanup_old_sessions');
  if (error) throw error;
  return data as number;
}

export async function cleanupOldLoginAttempts(): Promise<number> {
  const { data, error } = await supabase.rpc('cleanup_old_login_attempts');
  if (error) throw error;
  return data as number;
}

// ============================================================================
// BACKUP AND RECOVERY FUNCTIONS
// ============================================================================

export async function createBackup(
  backupName: string,
  backupType: 'full' | 'incremental' | 'manual'
): Promise<string> {
  const { data, error } = await supabase.rpc('create_backup_metadata', {
    p_backup_name: backupName,
    p_backup_type: backupType,
  });

  if (error) throw error;
  return data as string;
}

export async function updateBackupStatus(
  backupId: string,
  status: 'in_progress' | 'completed' | 'failed' | 'verified',
  backupSize?: number,
  tablesIncluded?: string[],
  rowCounts?: Record<string, number>,
  checksum?: string,
  errorMessage?: string
) {
  const { error } = await supabase.rpc('update_backup_status', {
    p_backup_id: backupId,
    p_status: status,
    p_backup_size: backupSize || null,
    p_tables_included: tablesIncluded || null,
    p_row_counts: rowCounts || null,
    p_checksum: checksum || null,
    p_error_message: errorMessage || null,
  });

  if (error) throw error;
}

export async function verifyBackup(backupId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('verify_backup', {
    p_backup_id: backupId,
  });

  if (error) throw error;
  return data as boolean;
}

export async function getBackups(
  backupType?: string,
  limit: number = 50
): Promise<BackupMetadata[]> {
  let query = supabase
    .from('backup_metadata')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (backupType) {
    query = query.eq('backup_type', backupType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getBackupSchedules(): Promise<BackupSchedule[]> {
  const { data, error } = await supabase
    .from('backup_schedule')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createBackupSchedule(
  schedule: Omit<BackupSchedule, 'id' | 'created_at' | 'updated_at' | 'last_run_at' | 'next_run_at'>
): Promise<BackupSchedule> {
  const { data, error } = await supabase
    .from('backup_schedule')
    .insert(schedule)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBackupSchedule(
  scheduleId: string,
  updates: Partial<BackupSchedule>
): Promise<BackupSchedule> {
  const { data, error } = await supabase
    .from('backup_schedule')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBackupSchedule(scheduleId: string) {
  const { error } = await supabase
    .from('backup_schedule')
    .delete()
    .eq('id', scheduleId);

  if (error) throw error;
}

export async function getRestoreHistory(
  limit: number = 50
): Promise<BackupRestoreHistory[]> {
  const { data, error } = await supabase
    .from('backup_restore_history')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getDatabaseStats(): Promise<DatabaseStats> {
  const { data, error } = await supabase.rpc('get_database_stats');
  if (error) throw error;
  return data as DatabaseStats;
}

export async function cleanupOldBackups(): Promise<number> {
  const { data, error } = await supabase.rpc('cleanup_old_backups');
  if (error) throw error;
  return data as number;
}

// ============================================================================
// PERFORMANCE MONITORING FUNCTIONS
// ============================================================================

export async function recordPerformanceMetric(
  metricType: string,
  metricName: string,
  metricValue: number,
  metadata?: Record<string, any>
): Promise<string> {
  const { data, error } = await supabase.rpc('record_performance_metric', {
    p_metric_type: metricType,
    p_metric_name: metricName,
    p_metric_value: metricValue,
    p_metadata: metadata || {},
  });

  if (error) throw error;
  return data as string;
}

export async function getPerformanceMetrics(
  metricType?: string,
  limit: number = 100
): Promise<PerformanceMetric[]> {
  let query = supabase
    .from('performance_metrics')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (metricType) {
    query = query.eq('metric_type', metricType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getTableSizes(): Promise<TableSize[]> {
  const { data, error } = await supabase.rpc('get_table_sizes');
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getIndexUsage(): Promise<IndexUsage[]> {
  const { data, error } = await supabase.rpc('get_index_usage');
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function cleanupOldPerformanceMetrics(): Promise<number> {
  const { data, error } = await supabase.rpc('cleanup_old_performance_metrics');
  if (error) throw error;
  return data as number;
}

// ============================================================================
// SECURITY DASHBOARD STATISTICS
// ============================================================================

export async function getSecurityDashboardStats() {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    failedLogins24h,
    successfulLogins24h,
    activeLockouts,
    securityEvents7d,
    activeSessions,
  ] = await Promise.all([
    supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('success', false)
      .gte('created_at', last24Hours),
    supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('success', true)
      .gte('created_at', last24Hours),
    supabase
      .from('account_lockouts')
      .select('*', { count: 'exact', head: true })
      .gte('locked_until', now.toISOString()),
    supabase
      .from('security_audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days),
    supabase
      .from('active_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('expires_at', now.toISOString()),
  ]);

  return {
    failedLogins24h: failedLogins24h.count || 0,
    successfulLogins24h: successfulLogins24h.count || 0,
    activeLockouts: activeLockouts.count || 0,
    securityEvents7d: securityEvents7d.count || 0,
    activeSessions: activeSessions.count || 0,
  };
}

// ============================================================================
// BACKUP DASHBOARD STATISTICS
// ============================================================================

export async function getBackupDashboardStats() {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalBackups,
    successfulBackups30d,
    failedBackups30d,
    lastBackup,
    activeSchedules,
  ] = await Promise.all([
    supabase
      .from('backup_metadata')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('backup_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('backup_status', 'completed')
      .gte('created_at', last30Days),
    supabase
      .from('backup_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('backup_status', 'failed')
      .gte('created_at', last30Days),
    supabase
      .from('backup_metadata')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('backup_schedule')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
  ]);

  return {
    totalBackups: totalBackups.count || 0,
    successfulBackups30d: successfulBackups30d.count || 0,
    failedBackups30d: failedBackups30d.count || 0,
    lastBackup: lastBackup.data,
    activeSchedules: activeSchedules.count || 0,
  };
}

// ============================================================================
// PERFORMANCE DASHBOARD STATISTICS
// ============================================================================

export async function getPerformanceDashboardStats() {
  const [tableSizes, indexUsage, recentMetrics] = await Promise.all([
    getTableSizes(),
    getIndexUsage(),
    getPerformanceMetrics(undefined, 10),
  ]);

  const totalDatabaseSize = tableSizes.reduce((acc, table) => {
    const sizeMatch = table.total_size.match(/(\d+(\.\d+)?)\s*(\w+)/);
    if (sizeMatch) {
      const value = Number.parseFloat(sizeMatch[1]);
      const unit = sizeMatch[3];
      let bytes = value;
      if (unit === 'MB') bytes *= 1024 * 1024;
      else if (unit === 'GB') bytes *= 1024 * 1024 * 1024;
      else if (unit === 'KB') bytes *= 1024;
      return acc + bytes;
    }
    return acc;
  }, 0);

  const totalRows = tableSizes.reduce((acc, table) => acc + table.row_count, 0);

  return {
    totalDatabaseSize: `${(totalDatabaseSize / (1024 * 1024)).toFixed(2)} MB`,
    totalRows,
    totalTables: tableSizes.length,
    totalIndexes: indexUsage.length,
    recentMetrics,
  };
}
