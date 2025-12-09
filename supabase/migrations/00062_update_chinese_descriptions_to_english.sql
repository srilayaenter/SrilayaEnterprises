/*
# Update Chinese Descriptions to English in Security Audit Logs

## Purpose
Update existing security audit log entries that have Chinese descriptions to English.

## Problem
Security audit logs contain Chinese text in the event_description field from previous entries.
This needs to be updated to English for consistency.

## Solution
Update all existing Chinese descriptions to their English equivalents:
- "用户登录成功" → "User logged in successfully"
- "新用户注册" → "New user registration"
- "用户登出" → "User logged out"

## Notes
- This is a one-time data migration
- Only affects existing records
- New records will use English descriptions from the updated code
*/

-- Update login success descriptions
UPDATE security_audit_logs
SET event_description = 'User logged in successfully'
WHERE event_description = '用户登录成功';

-- Update registration descriptions
UPDATE security_audit_logs
SET event_description = 'New user registration'
WHERE event_description = '新用户注册';

-- Update logout descriptions
UPDATE security_audit_logs
SET event_description = 'User logged out'
WHERE event_description = '用户登出';

-- Add comment for documentation
COMMENT ON TABLE security_audit_logs IS 
'Security audit logs tracking user authentication and security events. All descriptions should be in English.';
