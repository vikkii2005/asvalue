// src/lib/utils/crypto.ts

export class CryptoUtils {
  static generateRandomBytes(length: number): Uint8Array {
    if (typeof crypto === 'undefined')
      throw new Error('Web Crypto API not available')
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return array
  }

  static generateRandomString(length: number): string {
    const bytes = this.generateRandomBytes(Math.ceil((length * 3) / 4))
    return this.base64URLEncode(bytes).substring(0, length)
  }

  static generateOAuthState(): string {
    return this.generateRandomString(32)
  }

  static generateCodeVerifier(): string {
    return this.generateRandomString(128)
  }

  static async generateCodeChallenge(verifier: string): Promise<string> {
    if (typeof crypto === 'undefined' || !crypto.subtle)
      throw new Error('SubtleCrypto not available')
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return this.base64URLEncode(new Uint8Array(digest))
  }

  static async validateCodeChallenge(
    verifier: string,
    challenge: string
  ): Promise<boolean> {
    try {
      const computedChallenge = await this.generateCodeChallenge(verifier)
      return computedChallenge === challenge
    } catch {
      return false
    }
  }

  static base64URLEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...Array.from(buffer)))
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  static base64URLDecode(str: string): Uint8Array {
    str += '='.repeat((4 - (str.length % 4)) % 4)
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  static async hashString(input: string): Promise<string> {
    if (typeof crypto === 'undefined' || !crypto.subtle)
      throw new Error('SubtleCrypto not available')
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return this.base64URLEncode(new Uint8Array(digest))
  }

  static generateSessionId(): string {
    const timestamp = Date.now().toString(36)
    const randomPart = this.generateRandomString(16)
    return `sess_${timestamp}_${randomPart}`
  }

  static constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    let result = 0
    for (let i = 0; i < a.length; i++)
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    return result === 0
  }

  static async createBrowserFingerprint(): Promise<string> {
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      `${screen.width}x${screen.height}`,
      new Date().getTimezoneOffset().toString(),
      String(navigator.hardwareConcurrency ?? 'unknown'),
      String(deviceMemory ?? 'unknown'),
    ]
    const fingerprintString = components.join('|')
    return this.hashString(fingerprintString)
  }
}

// Main named exports
export const generateRandomString = (length: number) =>
  CryptoUtils.generateRandomString(length)
export const generateOAuthState = () => CryptoUtils.generateOAuthState()
export const generateCodeVerifier = () => CryptoUtils.generateCodeVerifier()
export const generateCodeChallenge = (verifier: string) =>
  CryptoUtils.generateCodeChallenge(verifier)
export const validateCodeChallenge = (verifier: string, challenge: string) =>
  CryptoUtils.validateCodeChallenge(verifier, challenge)
export const base64URLEncode = (buffer: Uint8Array) =>
  CryptoUtils.base64URLEncode(buffer)
export const base64URLDecode = (str: string) => CryptoUtils.base64URLDecode(str)
export const hashString = (input: string) => CryptoUtils.hashString(input)
export const generateSessionId = () => CryptoUtils.generateSessionId()
export const constantTimeEquals = (a: string, b: string) =>
  CryptoUtils.constantTimeEquals(a, b)
export const createBrowserFingerprint = () =>
  CryptoUtils.createBrowserFingerprint()
