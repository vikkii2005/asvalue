// src/lib/auth/session-hardening.ts
// Advanced session security

interface SessionFingerprint {
  userAgent: string;
  ipAddress: string;
  timezone: string;
  language: string;
}

export function generateSessionFingerprint(request: Request): SessionFingerprint {
  return {
    userAgent: request.headers.get('user-agent') || 'unknown',
    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: request.headers.get('accept-language')?.split(',')[0] || 'unknown'
  };
}

export function validateSessionFingerprint(
  stored: SessionFingerprint, 
  current: SessionFingerprint
): boolean {
  // Allow some flexibility but flag major changes
  const userAgentMatch = stored.userAgent === current.userAgent;
  const ipMatch = stored.ipAddress === current.ipAddress;
  
  // Session is valid if user agent matches (IP can change on mobile)
  return userAgentMatch;
}

export function createSecureSessionToken(): string {
  // Generate cryptographically secure token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function shouldRotateToken(tokenAge: number): boolean {
  // Rotate tokens every 24 hours
  return tokenAge > 24 * 60 * 60 * 1000;
}