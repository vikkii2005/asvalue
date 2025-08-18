// src/lib/auth/audit-logging.ts
// Enhanced security logging

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface AuditLogEntry {
  userId?: string
  eventType: 'signin' | 'signout' | 'failure' | 'security_violation'
  success: boolean
  ipAddress: string
  userAgent: string
  errorMessage?: string
  securityDetails?: Record<string, unknown>
}

export async function logAuthEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabase.from('auth_audit_log').insert({
      user_id: entry.userId,
      event_type: entry.eventType,
      success: entry.success,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      error_message: entry.errorMessage,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Failed to log audit event:', error)
    } else {
      console.log('📋 Audit logged:', entry.eventType)
    }
  } catch (error) {
    console.error('Audit logging error:', error)
  }
}

export async function detectSuspiciousActivity(
  userId: string,
  ipAddress: string
): Promise<boolean> {
  try {
    // Check for multiple failed attempts in last 10 minutes
    const { data, error } = await supabase
      .from('auth_audit_log')
      .select('*')
      .eq('user_id', userId)
      .eq('success', false)
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())

    if (error || !data) return false

    // Flag as suspicious if >3 failures in 10 minutes
    const isSuspicious = data.length >= 3

    if (isSuspicious) {
      await logAuthEvent({
        userId,
        eventType: 'security_violation',
        success: false,
        ipAddress,
        userAgent: 'Security Monitor',
        errorMessage: 'Multiple failed login attempts detected',
      })
    }

    return isSuspicious
  } catch (error) {
    console.error('Suspicious activity detection error:', error)
    return false
  }
}
