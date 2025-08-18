// src/app/auth/callback/route.ts - UUID FIXED VERSION
import { NextRequest } from 'next/server';
import { validateState } from '@/lib/auth/state';
import { exchangeCodeForTokens, fetchGoogleUserInfo } from '@/lib/auth/google';
import { randomUUID } from 'crypto'; // ✅ Add this import

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const state = requestUrl.searchParams.get('state');

    console.log('🎯 OAuth callback received!');

    if (!code || !state) {
      console.log('❌ Missing code or state parameter');
      return Response.redirect(new URL('/auth/error?error=missing_params', request.url));
    }

    // Validate state
    const codeVerifier = await validateState(state);
    if (!codeVerifier) {
      console.log('❌ Invalid or expired state');
      return Response.redirect(new URL('/auth/error?error=invalid_state', request.url));
    }

    console.log('✅ State validation passed');

    // Get tokens from Google
    const tokenResponse = await exchangeCodeForTokens(code, codeVerifier);
    if (tokenResponse.error) {
      console.error('❌ Token exchange failed:', tokenResponse.error);
      return Response.redirect(new URL('/auth/error?error=token_exchange_failed', request.url));
    }

    console.log('✅ Got tokens from Google successfully');

    // Get user info from Google
    const userInfo = await fetchGoogleUserInfo(tokenResponse.access_token);
    console.log('✅ Got user info from Google:', userInfo.email);

    // ✅ FIXED: Create proper UUID instead of fake ID
    const properUserId = randomUUID(); // Generates: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    
    // Create session data with REAL UUID
    const sessionData = {
      userId: properUserId, // ✅ Real UUID format
      email: userInfo.email,
      fullName: userInfo.name,
      avatarUrl: userInfo.picture,
      authenticated: true,
      timestamp: Date.now()
    };

    const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    
    const redirectUrl = new URL('/auth/success', request.url);
    
    const response = new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString(),
        'Set-Cookie': `asvalue-authenticated=${sessionValue}; Path=/; SameSite=Lax; Max-Age=3600`
      }
    });

    console.log('✅ Authentication with real UUID completed:', properUserId);
    return response;

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return Response.redirect(new URL('/auth/error?error=unexpected_error', request.url));
  }
}