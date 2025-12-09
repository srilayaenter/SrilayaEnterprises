# Security Dashboard - Quick Access Guide

## How to Access the Security Dashboard

### Method 1: Direct URL
Simply navigate to:
```
/admin/security
```

### Method 2: Via Admin Dashboard Navigation
1. Log in as an administrator
2. Navigate to the Admin Dashboard (`/admin`)
3. In the left sidebar, find the **"System"** section
4. Click on **"Security"** (with the shield check icon ⚡)

## What You'll See

### Dashboard Overview
When you access the Security Dashboard, you'll see:

#### Top Statistics Bar (5 Cards)
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Failed Logins   │ Successful      │ Active          │ Security        │ Active          │
│ (24h)           │ Logins (24h)    │ Lockouts        │ Events (7d)     │ Sessions        │
│                 │                 │                 │                 │                 │
│ ⚠️  [Number]    │ 🛡️  [Number]    │ 🔒  [Number]    │ 📊  [Number]    │ 👥  [Number]    │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

#### Tabbed Interface
Four tabs for detailed information:

**1. Audit Logs**
- View all security-related events
- See event types, descriptions, IP addresses, and timestamps
- Track system-wide security activities

**2. Login Attempts**
- Monitor both successful and failed login attempts
- View email addresses, IP addresses, and failure reasons
- Clean up old login attempt records

**3. Account Lockouts**
- See which accounts are currently locked
- View lockout reasons and expiration times
- Monitor security-triggered account restrictions

**4. Active Sessions**
- View all currently active user sessions
- See user IDs, IP addresses, and activity times
- Delete individual sessions or cleanup expired ones

## Key Features

### Refresh Data
Click the **"Refresh"** button in the top-right corner to reload all security data.

### Session Management
In the "Active Sessions" tab:
- **Delete Session**: Click the trash icon next to any session to terminate it
- **Cleanup Expired**: Click the "Cleanup Expired" button to remove all expired sessions

### Login Attempt Management
In the "Login Attempts" tab:
- **Cleanup Old**: Click the "Cleanup Old" button to archive old login attempt records

## Security Metrics Explained

### Failed Logins (24h)
- **What it shows**: Number of unsuccessful login attempts in the last 24 hours
- **Why it matters**: High numbers may indicate brute force attacks
- **Action**: Investigate patterns and consider IP blocking

### Successful Logins (24h)
- **What it shows**: Number of successful authentications in the last 24 hours
- **Why it matters**: Helps understand normal usage patterns
- **Action**: Compare with expected user activity

### Active Lockouts
- **What it shows**: Number of accounts currently locked
- **Why it matters**: Indicates potential security incidents or user issues
- **Action**: Review lockout reasons and assist legitimate users

### Security Events (7d)
- **What it shows**: Total security-related events in the past week
- **Why it matters**: Overall security activity indicator
- **Action**: Monitor trends and investigate spikes

### Active Sessions
- **What it shows**: Number of currently active user sessions
- **Why it matters**: Helps monitor concurrent users and detect anomalies
- **Action**: Verify session counts match expected usage

## Best Practices

### Daily Monitoring
- Check failed login counts for unusual spikes
- Review active lockouts and assist legitimate users
- Monitor active sessions for anomalies

### Weekly Review
- Analyze security event trends
- Review audit logs for suspicious patterns
- Clean up old login attempts and expired sessions

### Incident Response
1. Check "Login Attempts" tab for attack patterns
2. Review "Audit Logs" for related security events
3. Check "Active Sessions" for unauthorized access
4. Use "Account Lockouts" to verify protective measures

### Maintenance Tasks
- **Weekly**: Cleanup old login attempts
- **Weekly**: Cleanup expired sessions
- **Monthly**: Review and export audit logs for compliance

## Troubleshooting

### No Data Showing
- Ensure you're logged in as an administrator
- Check that security tables are properly initialized
- Verify database connection is active

### High Failed Login Count
- Review IP addresses in "Login Attempts" tab
- Look for patterns (same IP, same email)
- Consider implementing IP blocking
- Check for legitimate user issues (forgotten passwords)

### Unexpected Lockouts
- Review lockout reasons in "Account Lockouts" tab
- Verify lockout policies are correctly configured
- Assist legitimate users in regaining access

## Security Considerations

### Access Control
- Only administrators can access the Security Dashboard
- All actions are logged in the audit trail
- Session management requires admin privileges

### Data Privacy
- User IDs are truncated in session displays
- IP addresses are logged for security purposes
- All data follows privacy compliance requirements

### Audit Trail
- All security events are permanently logged
- Audit logs cannot be deleted (only archived)
- Timestamps use server time for consistency

## Support

For issues or questions about the Security Dashboard:
1. Check the audit logs for error events
2. Review the database migration files for schema details
3. Consult the API documentation in `/src/db/security-api.ts`
4. Check the component code in `/src/pages/admin/SecurityDashboard.tsx`

---

**Note**: The Security Dashboard is a critical tool for maintaining system security. Regular monitoring and prompt response to security events are essential for protecting your application and users.
