// src/lib/auth/pkce.ts
// PKCE (Proof Key for Code Exchange) security implementation

// Generate a random code verifier (128 characters)
export function generateCodeVerifier(): string {
  const array = new Uint8Array(96); // 96 bytes = 128 base64url characters
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

// Generate code challenge from verifier using SHA256
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

// Validate PKCE code verifier against challenge
export async function validatePKCE(verifier: string, challenge: string): Promise<boolean> {
  const computedChallenge = await generateCodeChallenge(verifier);
  return computedChallenge === challenge;
}

// Helper function: Convert ArrayBuffer to base64url string
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Helper function: Convert base64url string back to Uint8Array
export function base64URLDecode(str: string): Uint8Array {
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