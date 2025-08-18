// src/lib/auth/audit-logging.ts
// Security event logging

import { supabaseClient } from '@/lib/supabase/config';

export type AuthEventType = 'signin' | 'signout' | 'failure' | 'suspicious_activity' | 'token_refresh';

export interface AuthAuditLogEntry {
  id?: string;
  userId?: string;
  eventType: AuthEventType;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  sessionId?: string;
  details?: Record<string, unknown>;
  createdAt?: Date;
}

export async function logAuthEvent(entry: AuthAuditLogEntry): Promise<void> {
  await supabaseClient
    .from('auth_audit_log')
    .insert({
      user_id: entry.userId,
      event_type: entry.eventType,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      session_id: entry.sessionId,
      details: entry.details ? JSON.stringify(entry.details) : null,
      success: entry.success,
      error_message: entry.errorMessage,
      created_at: entry.createdAt ? entry.createdAt.toISOString() : new Date().toISOString(),
    });
}

export async function getUserAuthEvents(userId: string, limit = 20) {
  const { data, error } = await supabaseClient
    .from('auth_audit_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}