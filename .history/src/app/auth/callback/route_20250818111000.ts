// src/app/auth/callback/route.ts
// SIMPLIFIED - Back to working basics

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/config';
import { validateState } from '@/lib/auth/state';
import { exchangeCodeForTokens, fetchGoogleUserInfo } from '@/lib/auth/google';

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

    // Get user info from Google
    const userInfo = await fetchGoogleUserInfo(tokenResponse.access_token);
    console.log('✅ Got user info from Google:', userInfo.email);

    // *** SIMPLIFIED: Just set a simple cookie and redirect to success ***
    const sessionData = {
      email: userInfo.email,
      fullName: userInfo.name,
      avatarUrl: userInfo.picture,
      authenticated: true,
      timestamp: Date.now()
    };

    const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    
    // Simple redirect to success page (like the original plan)
    const response = Response.redirect(new URL('/auth/success', request.url));
    
    response.headers.set('Set-Cookie', `asvalue-authenticated=${sessionValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`);

    console.log('✅ Simple authentication completed - redirecting to success page');
    return response;

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return Response.redirect(new URL('/auth/error?error=unexpected_error', request.url));
  }
}