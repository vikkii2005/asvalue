// src/app/auth/callback/route.ts
// FIXED - Now saves users to Supabase profiles table

import { NextRequest } from 'next/server';
import { validateState } from '@/lib/auth/state';
import { exchangeCodeForTokens, fetchGoogleUserInfo } from '@/lib/auth/google';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for database writes
);

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

    // Generate proper UUID
    const properUserId = randomUUID();
    
    // 🔧 NEW: Save user to Supabase profiles table
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: properUserId,
          email: userInfo.email,
          full_name: userInfo.name,
          avatar_url: userInfo.picture,
          role: null, // Will be set when they select role
          onboarding_completed: false,
          phone_verified: false,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email' // If email exists, update the record
        });

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
      } else {
        console.log('✅ User saved to profiles table:', properUserId);
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
    }

    // Create session data
    const sessionData = {
      userId: properUserId,
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

    console.log('✅ Authentication completed with database save:', properUserId);
    return response;

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return Response.redirect(new URL('/auth/error?error=unexpected_error', request.url));
  }
}