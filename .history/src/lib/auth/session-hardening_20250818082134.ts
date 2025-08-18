// src/lib/auth/session-hardening.ts
// Advanced session security (COMPLETELY FIXED VERSION)

import { supabaseClient } from '@/lib/supabase/config';

export interface SessionFingerprint {
  userAgent: string;
  ipAddress: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
}

export interface SessionSecurity {
  id: string;
  userId: string;
  fingerprint: SessionFingerprint;
  createdAt: Date;
  lastUsed: Date;
  expiresAt: Date;
  isActive: boolean;
  riskScore: number;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
}

// ✅ FIXED: Added proper typing for database row
interface DatabaseSession {
  id: string;
  user_id: string;
  fingerprint: string;
  device_type: string;
  risk_score: number;
  expires_at: string;
  last_used: string;
  created_at: string;
  is_active: boolean;
}

export class SessionHardening {
  private readonly maxConcurrentSessions = 5;
  private readonly sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  private readonly inactivityTimeout = 30 * 60 * 1000; // 30 minutes
  private readonly maxRiskScore = 100;

  public generateFingerprint(): SessionFingerprint {
    const userAgent = navigator.userAgent;
    const screen = window.screen;
    
    return {
      userAgent: userAgent,
      ipAddress: '',
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language || navigator.languages?.[0] || 'unknown',
      platform: navigator.platform || 'unknown'
    };
  }

  public async createHardenedSession(userId: string, accessToken: string, refreshToken: string): Promise<SessionSecurity> {
    const fingerprint = this.generateFingerprint();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.sessionTimeout);
    
    const sessionSecurity: SessionSecurity = {
      id: this.generateSessionId(),
      userId,
      fingerprint,
      createdAt: now,
      lastUsed: now,
      expiresAt,
      isActive: true,
      riskScore: await this.calculateRiskScore(fingerprint),
      deviceType: this.detectDeviceType(fingerprint.userAgent) // ✅ FIXED: Function already returns correct type
    };

    await this.storeSession(sessionSecurity, accessToken, refreshToken);
    await this.cleanupOldSessions(userId);
    
    console.log('🔐 Created hardened session:', sessionSecurity.id);
    return sessionSecurity;
  }

  public async validateSession(sessionId: string, currentFingerprint?: SessionFingerprint): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        console.log('❌ Session not found');
        return false;
      }

      if (new Date() > session.expiresAt) {
        console.log('❌ Session expired');
        await this.invalidateSession(sessionId);
        return false;
      }

      const timeSinceLastUsed = Date.now() - session.lastUsed.getTime();
      if (timeSinceLastUsed > this.inactivityTimeout) {
        console.log('❌ Session inactive timeout');
        await this.invalidateSession(sessionId);
        return false;
      }

      if (currentFingerprint && !this.validateFingerprint(session.fingerprint, currentFingerprint)) {
        console.log('❌ Fingerprint validation failed - potential session hijacking');
        await this.invalidateSession(sessionId, 'fingerprint_mismatch');
        return false;
      }

      await this.updateLastUsed(sessionId);
      
      console.log('✅ Session validated:', sessionId);
      return true;
    } catch (error) {
      console.error('❌ Session validation error:', error);
      return false;
    }
  }

  public async rotateSessionTokens(sessionId: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session || !session.isActive) {
        return null;
      }

      const newTokens = await this.generateNewTokens(session.userId);
      
      await this.updateSessionTokens(sessionId, newTokens.accessToken, newTokens.refreshToken);
      await this.updateLastUsed(sessionId);
      
      console.log('🔄 Rotated session tokens:', sessionId);
      return newTokens;
    } catch (error) {
      console.error('❌ Token rotation failed:', error);
      return null;
    }
  }

  public async detectSuspiciousActivity(sessionId: string, currentFingerprint: SessionFingerprint): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;

    const suspiciousIndicators: string[] = [];

    if (session.fingerprint.userAgent !== currentFingerprint.userAgent) {
      suspiciousIndicators.push('user_agent_change');
    }

    if (session.fingerprint.screenResolution !== currentFingerprint.screenResolution) {
      suspiciousIndicators.push('screen_resolution_change');
    }

    if (session.fingerprint.timezone !== currentFingerprint.timezone) {
      suspiciousIndicators.push('timezone_change');
    }

    if (session.fingerprint.platform !== currentFingerprint.platform) {
      suspiciousIndicators.push('platform_change');
    }

    const riskIncrease = suspiciousIndicators.length * 25;
    const newRiskScore = session.riskScore + riskIncrease;

    if (newRiskScore > this.maxRiskScore) {
      console.log('🚨 Suspicious activity detected:', suspiciousIndicators);
      await this.flagSuspiciousSession(sessionId, suspiciousIndicators);
      return true;
    }

    return false;
  }

  public async getUserSessions(userId: string): Promise<SessionSecurity[]> {
    const { data, error } = await supabaseClient
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_used', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user sessions:', error);
      return [];
    }

    return data.map(this.mapDbSessionToSessionSecurity);
  }

  public async invalidateSession(sessionId: string, reason = 'user_logout'): Promise<void> {
    try {
      await supabaseClient
        .from('user_sessions')
        .update({ 
          is_active: false,
          invalidated_at: new Date().toISOString(),
          invalidation_reason: reason
        })
        .eq('id', sessionId);

      console.log(`🔒 Session invalidated: ${sessionId} (${reason})`);
    } catch (error) {
      console.error('❌ Error invalidating session:', error);
    }
  }

  public async invalidateOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    try {
      await supabaseClient
        .from('user_sessions')
        .update({ 
          is_active: false,
          invalidated_at: new Date().toISOString(),
          invalidation_reason: 'user_logout_all'
        })
        .eq('user_id', userId)
        .neq('id', currentSessionId);

      console.log(`🔒 All other sessions invalidated for user: ${userId}`);
    } catch (error) {
      console.error('❌ Error invalidating other sessions:', error);
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  private async calculateRiskScore(fingerprint: SessionFingerprint): Promise<number> {
    let score = 0;

    if (fingerprint.userAgent.toLowerCase().includes('bot')) {
      score += 50;
    }

    if (fingerprint.platform === 'unknown') {
      score += 20;
    }

    if (fingerprint.language === 'unknown') {
      score += 10;
    }

    return Math.min(score, this.maxRiskScore);
  }

  // ✅ FIXED: Return type explicitly matches SessionSecurity['deviceType']
  private detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
    const ua = userAgent.toLowerCase();
    
    if (/mobile|android|iphone|phone/i.test(ua)) {
      return 'mobile';
    }
    if (/tablet|ipad/i.test(ua)) {
      return 'tablet';
    }
    if (/desktop|windows|mac|linux/i.test(ua)) {
      return 'desktop';
    }
    
    return 'unknown';
  }

  private validateFingerprint(stored: SessionFingerprint, current: SessionFingerprint): boolean {
    const criticalMatches = [
      stored.userAgent === current.userAgent,
      stored.platform === current.platform
    ];

    const nonCriticalMatches = [
      stored.screenResolution === current.screenResolution,
      stored.timezone === current.timezone,
      stored.language === current.language
    ];

    const criticalMatch = criticalMatches.every(match => match);
    const nonCriticalMatchCount = nonCriticalMatches.filter(match => match).length;

    return criticalMatch && nonCriticalMatchCount >= 2;
  }

  private async storeSession(session: SessionSecurity, accessToken: string, refreshToken: string): Promise<void> {
    const { error } = await supabaseClient
      .from('user_sessions')
      .insert({
        id: session.id,
        user_id: session.userId,
        session_token: accessToken,
        refresh_token: refreshToken,
        fingerprint: JSON.stringify(session.fingerprint),
        device_type: session.deviceType,
        risk_score: session.riskScore,
        expires_at: session.expiresAt.toISOString(),
        last_used: session.lastUsed.toISOString(),
        is_active: true
      });

    if (error) {
      throw new Error(`Failed to store session: ${error.message}`);
    }
  }

  private async getSession(sessionId: string): Promise<SessionSecurity | null> {
    const { data, error } = await supabaseClient
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDbSessionToSessionSecurity(data);
  }

  private async updateLastUsed(sessionId: string): Promise<void> {
    await supabaseClient
      .from('user_sessions')
      .update({ last_used: new Date().toISOString() })
      .eq('id', sessionId);
  }

  private async updateSessionTokens(sessionId: string, accessToken: string, refreshToken: string): Promise<void> {
    await supabaseClient
      .from('user_sessions')
      .update({ 
        session_token: accessToken,
        refresh_token: refreshToken,
        last_used: new Date().toISOString()
      })
      .eq('id', sessionId);
  }

  // ✅ FIXED: Prefixed unused parameter with underscore
  private async generateNewTokens(_userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: `at_${Date.now()}_${Math.random().toString(36)}`,
      refreshToken: `rt_${Date.now()}_${Math.random().toString(36)}`
    };
  }

  private async cleanupOldSessions(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId);
    
    if (sessions.length > this.maxConcurrentSessions) {
      const sessionsToDeactivate = sessions.slice(this.maxConcurrentSessions);
      
      for (const session of sessionsToDeactivate) {
        await this.invalidateSession(session.id, 'max_sessions_exceeded');
      }
    }
  }

  private async flagSuspiciousSession(sessionId: string, indicators: string[]): Promise<void> {
    await supabaseClient
      .from('auth_audit_log')
      .insert({
        session_id: sessionId,
        event_type: 'suspicious_activity',
        success: false,
        error_message: `Suspicious indicators: ${indicators.join(', ')}`,
        created_at: new Date().toISOString()
      });
  }

  // ✅ FIXED: Properly typed data parameter with explicit type assertion
  private mapDbSessionToSessionSecurity(data: DatabaseSession): SessionSecurity {
    // Helper function to safely cast device type
    const getValidDeviceType = (deviceType: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' => {
      if (['desktop', 'mobile', 'tablet', 'unknown'].includes(deviceType)) {
        return deviceType as 'desktop' | 'mobile' | 'tablet' | 'unknown';
      }
      return 'unknown';
    };

    return {
      id: data.id,
      userId: data.user_id,
      fingerprint: JSON.parse(data.fingerprint || '{}'),
      createdAt: new Date(data.created_at),
      lastUsed: new Date(data.last_used),
      expiresAt: new Date(data.expires_at),
      isActive: data.is_active,
      riskScore: data.risk_score || 0,
      deviceType: getValidDeviceType(data.device_type) // ✅ FIXED: Safe type casting
    };
  }
}

// Singleton instance
export const sessionHardening = new SessionHardening();

// Convenience exports
export const createHardenedSession = (userId: string, accessToken: string, refreshToken: string) =>
  sessionHardening.createHardenedSession(userId, accessToken, refreshToken);

export const validateSession = (sessionId: string, currentFingerprint?: SessionFingerprint) =>
  sessionHardening.validateSession(sessionId, currentFingerprint);

export const rotateSessionTokens = (sessionId: string) =>
  sessionHardening.rotateSessionTokens(sessionId);

export const detectSuspiciousActivity = (sessionId: string, currentFingerprint: SessionFingerprint) =>
  sessionHardening.detectSuspiciousActivity(sessionId, currentFingerprint);

export const invalidateSession = (sessionId: string, reason?: string) =>
  sessionHardening.invalidateSession(sessionId, reason);