/*
# Security Enhancements Migration

## Overview
This migration adds comprehensive security features to protect against attacks and unauthorized access.

## Changes

### 1. New Tables
- `security_audit_logs`: Tracks all security-related events
  - `id` (uuid, primary key)
  - `user_id` (uuid, nullable, references profiles)
  - `event_type` (text, not null) - Type of security event
  - `event_description` (text) - Detailed description
  - `ip_address` (text) - IP address of the request
  - `user_agent` (text) - Browser/client information
  - `metadata` (jsonb) - Additional event data
  - `created_at` (timestamptz, default: now())

- `login_attempts`: Tracks failed login attempts for rate limiting
  - `id` (uuid, primary key)
  - `email` (text, not null)
  - `ip_address` (text, not null)
  - `success` (boolean, default: false)
  - `failure_reason` (text)
  - `created_at` (timestamptz, default: now())

- `account_lockouts`: Manages temporary account lockouts
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `email` (text, not null)
  - `locked_until` (timestamptz, not null)
  - `reason` (text)
  - `created_at` (timestamptz, default: now())

- `active_sessions`: Tracks active user sessions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `session_token` (text, unique, not null)
  - `ip_address` (text)
  - `user_agent` (text)
  - `last_activity` (timestamptz, default: now())
  - `expires_at` (timestamptz, not null)
  - `created_at` (timestamptz, default: now())

### 2. Security Functions
- `log_security_event()`: Logs security events
- `check_account_lockout()`: Checks if account is locked
- `record_login_attempt()`: Records login attempts
- `cleanup_old_sessions()`: Removes expired sessions
- `get_failed_login_count()`: Gets failed login count for rate limiting

### 3. Indexes
- Indexes on frequently queried fields for performance
- Composite indexes for security queries

### 4. Security Policies
- RLS enabled on all security tables
- Admins have full access
- Users can view their own security logs
