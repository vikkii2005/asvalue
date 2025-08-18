// src/lib/utils/crypto.ts
// Cryptographic utility functions

export class CryptoUtils {
  // Generate cryptographically secure random bytes
  public static generateRandomBytes(length: number): Uint8Array {
    if (typeof crypto === 'undefined') {
      throw new Error('Web Crypto API not available');
    }
    
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  }

  // Generate a secure random string
  public static generateRandomString(length: number): string {
    const bytes = this.generateRandomBytes(Math.ceil(length * 3 / 4));
    return this.base64URLEncode(bytes).substring(0, length);
  }

  // Generate OAuth state parameter
  public static generateOAuthState(): string {
    return this.generateRandomString(32);
  }

  // Generate PKCE code verifier
  public static generateCodeVerifier(): string {
    return this.generateRandomString(128);
  }

  // Generate PKCE code challenge from verifier
  public static async generateCodeChallenge(verifier: string): Promise<string> {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      throw new Error('SubtleCrypto not available');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(digest));
  }

  // Validate PKCE code verifier against challenge
  public static async validateCodeChallenge(verifier: string, challenge: string): Promise<boolean> {
    try {
      const computedChallenge = await this.generateCodeChallenge(verifier);
      return computedChallenge === challenge;
    } catch {
      return false;
    }
  }

  // Base64 URL encoding (RFC 4648 Section 5)
  public static base64URLEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...Array.from(buffer)));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Base64 URL decoding
  public static base64URLDecode(str: string): Uint8Array {
    // Add padding if needed
    str += '='.repeat((4 - str.length % 4) % 4);
    
    // Replace URL-safe characters
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode base64
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  }

  // Hash a string using SHA-256
  public static async hashString(input: string): Promise<string> {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      throw new Error('SubtleCrypto not available');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(digest));
  }

  // Generate a secure session ID
  public static generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = this.generateRandomString(16);
    return `sess_${timestamp}_${randomPart}`;
  }

  // Generate a secure API key
  public static generateApiKey(): string {
    const prefix = 'ak_';
    const timestamp = Date.now().toString(36);
    const randomPart = this.generateRandomString(32);
    return `${prefix}${timestamp}_${randomPart}`;
  }

  // Constant-time string comparison to prevent timing attacks
  public static constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  // Generate a secure token for password reset, email verification, etc.
  public static generateSecureToken(): string {
    return this.generateRandomString(48);
  }

  // Create a fingerprint for browser/device identification
  public static async createBrowserFingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || 'unknown',
      navigator.deviceMemory?.toString() || 'unknown'
    ];

    const fingerprintString = components.join('|');
    return this.hashString(fingerprintString);
  }

  // Validate that a string is a valid base64url encoded value
  public static isValidBase64URL(str: string): boolean {
    const base64URLPattern = /^[A-Za-z0-9_-]*$/;
    return base64URLPattern.test(str);
  }

  // Generate a nonce for CSP (Content Security Policy)
  public static generateNonce(): string {
    return this.base64URLEncode(this.generateRandomBytes(16));
  }

  // Time-safe token generation with expiration
  public static generateTimedToken(expirationMinutes = 60): string {
    const expirationTime = Date.now() + (expirationMinutes * 60 * 1000);
    const randomPart = this.generateRandomString(32);
    return `${expirationTime.toString(36)}_${randomPart}`;
  }

  // Validate a timed token
  public static validateTimedToken(token: string): boolean {
    try {
      const [expirationHex, _randomPart] = token.split('_');
      const expirationTime = parseInt(expirationHex, 36);
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  }
}

// Convenience exports
export const generateRandomString = (length: number) => CryptoUtils.generateRandomString(length);
export const generateOAuthState = () => CryptoUtils.generateOAuthState();
export const generateCodeVerifier = () => CryptoUtils.generateCodeVerifier();
export const generateCodeChallenge = (verifier: string) => CryptoUtils.generateCodeChallenge(verifier);
export const validateCodeChallenge = (verifier: string, challenge: string) => CryptoUtils.validateCodeChallenge(verifier, challenge);
export const base64URLEncode = (buffer: Uint8Array) => CryptoUtils.base64URLEncode(buffer);
export const base64URLDecode = (str: string) => CryptoUtils.base64URLDecode(str);
export const hashString = (input: string) => CryptoUtils.hashString(input);
export const generateSessionId = () => CryptoUtils.generateSessionId();
export const constantTimeEquals = (a: string, b: string) => CryptoUtils.constantTimeEquals(a, b);
export const createBrowserFingerprint = () => CryptoUtils.createBrowserFingerprint();
export const generateNonce = () => CryptoUtils.generateNonce();