import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  AlertTriangle,
  Lock,
  Activity,
  Users,
  RefreshCw,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  getSecurityDashboardStats,
  getSecurityAuditLogs,
  getLoginAttempts,
  getAccountLockouts,
  getActiveSessions,
  deleteSession,
  cleanupOldSessions,
  cleanupOldLoginAttempts,
} from '@/db/security-api';
import type {
  SecurityAuditLog,
  LoginAttempt,
  AccountLockout,
  ActiveSession,
} from '@/types/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function SecurityDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    failedLogins24h: 0,
    successfulLogins24h: 0,
    activeLockouts: 0,
    securityEvents7d: 0,
    activeSessions: 0,
  });
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [lockouts, setLockouts] = useState<AccountLockout[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, logsData, attemptsData, lockoutsData, sessionsData] =
        await Promise.all([
          getSecurityDashboardStats(),
          getSecurityAuditLogs(undefined, 50),
          getLoginAttempts(undefined, 50),
          getAccountLockouts(),
          getActiveSessions(),
        ]);

      setStats(statsData);
      setAuditLogs(logsData);
      setLoginAttempts(attemptsData);
      setLockouts(lockoutsData);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      toast({
        title: 'Success',
        description: 'Session deleted successfully',
      });
      loadData();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive',
      });
    }
  };

  const handleCleanupSessions = async () => {
    try {
      const count = await cleanupOldSessions();
      toast({
        title: 'Success',
        description: `Cleaned up ${count} expired sessions`,
      });
      loadData();
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to cleanup sessions',
        variant: 'destructive',
      });
    }
  };

  const handleCleanupLoginAttempts = async () => {
    try {
      const count = await cleanupOldLoginAttempts();
      toast({
        title: 'Success',
        description: `Cleaned up ${count} old login attempts`,
      });
      loadData();
    } catch (error) {
      console.error('Error cleaning up login attempts:', error);
      toast({
        title: 'Error',
        description: 'Failed to cleanup login attempts',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor security events and manage access
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedLogins24h}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Logins (24h)</CardTitle>
            <Shield className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulLogins24h}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lockouts</CardTitle>
            <Lock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLockouts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events (7d)</CardTitle>
            <Activity className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.securityEvents7d}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit-logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="login-attempts">Login Attempts</TabsTrigger>
          <TabsTrigger value="lockouts">Account Lockouts</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Logs</CardTitle>
              <CardDescription>
                Recent security events and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">{log.event_type}</Badge>
                      </TableCell>
                      <TableCell>{log.event_description}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login-attempts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Login Attempts</CardTitle>
                <CardDescription>
                  Track successful and failed login attempts
                </CardDescription>
              </div>
              <Button onClick={handleCleanupLoginAttempts} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Cleanup Old
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Failure Reason</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginAttempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell>{attempt.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={attempt.success ? 'default' : 'destructive'}
                        >
                          {attempt.success ? 'Success' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {attempt.ip_address}
                      </TableCell>
                      <TableCell>{attempt.failure_reason || 'N/A'}</TableCell>
                      <TableCell>{formatDate(attempt.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lockouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Lockouts</CardTitle>
              <CardDescription>
                Accounts temporarily locked due to security concerns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Locked Until</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lockouts.map((lockout) => (
                    <TableRow key={lockout.id}>
                      <TableCell>{lockout.email}</TableCell>
                      <TableCell>{lockout.reason}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            new Date(lockout.locked_until) > new Date()
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {formatDate(lockout.locked_until)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(lockout.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Currently active user sessions
                </CardDescription>
              </div>
              <Button onClick={handleCleanupSessions} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Cleanup Expired
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono text-sm">
                        {session.user_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {session.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(session.last_activity)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            new Date(session.expires_at) > new Date()
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {formatDate(session.expires_at)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleDeleteSession(session.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
