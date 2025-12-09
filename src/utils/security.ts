// Security utility functions
import { supabase } from '@/db/supabase';
import {
  logSecurityEvent,
  recordLoginAttempt,
} from '@/db/security-api';

// Get user IP address (via third-party service)
export async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return 'unknown';
  }
}

// Get user agent string
export function getUserAgent(): string {
  return navigator.userAgent || 'unknown';
}

// Generate session token
export function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Log login attempt
export async function logLoginAttempt(
  email: string,
  success: boolean,
  failureReason?: string
) {
  try {
    const ipAddress = await getUserIP();
    await recordLoginAttempt(email, ipAddress, success, failureReason);
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}

// Log security event
export async function logSecurityEventWrapper(
  userId: string | null,
  eventType: string,
  eventDescription: string,
  metadata?: Record<string, any>
) {
  try {
    const ipAddress = await getUserIP();
    const userAgent = getUserAgent();
    await logSecurityEvent(
      userId,
      eventType,
      eventDescription,
      ipAddress,
      userAgent,
      metadata
    );
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Create active session
export async function createActiveSession(userId: string) {
  try {
    const ipAddress = await getUserIP();
    const userAgent = getUserAgent();
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires after 24 hours

    const { error } = await supabase
      .from('active_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      console.error('Failed to create active session:', error);
    }

    return sessionToken;
  } catch (error) {
    console.error('Failed to create active session:', error);
    return null;
  }
}

// Update session activity time
export async function updateSessionActivity(sessionToken: string) {
  try {
    const { error } = await supabase
      .from('active_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_token', sessionToken);

    if (error) {
      console.error('Failed to update session activity:', error);
    }
  } catch (error) {
    console.error('Failed to update session activity:', error);
  }
}

// Delete session (on logout)
export async function deleteActiveSession(userId: string) {
  try {
    const { error } = await supabase
      .from('active_sessions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to delete active session:', error);
    }
  } catch (error) {
    console.error('Failed to delete active session:', error);
  }
}

// Cleanup expired sessions
export async function cleanupExpiredSessions() {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('active_sessions')
      .delete()
      .lt('expires_at', now);

    if (error) {
      console.error('Failed to cleanup expired sessions:', error);
    }
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
}
