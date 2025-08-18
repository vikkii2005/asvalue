// src/app/auth/callback/route.ts
// FIXED - Create real user in Supabase

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateState } from '@/lib/auth/state';
import { exchangeCodeForTokens, fetchGoogleUserInfo } from '@/lib/auth/google';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const state = requestUrl.searchParams.get('state');

    console.log('🎯 OAuth callback received!');

    if (!code || !state) {
      return Response.redirect(new URL('/auth/error?error=missing_params', request.url));
    }

    // Validate state
    const codeVerifier = await validateState(state);
    if (!codeVerifier) {
      return Response.redirect(new URL('/auth/error?error=invalid_state', request.url));
    }

    // Get tokens from Google
    const tokenResponse = await exchangeCodeForTokens(code, codeVerifier);
    if (tokenResponse.error) {
      return Response.redirect(new URL('/auth/error?error=token_exchange_failed', request.url));
    }

    // Get user info from Google
    const userInfo = await fetchGoogleUserInfo(tokenResponse.access_token);
    console.log('✅ Got user info from Google:', userInfo.email);

    // FIXED: Create or get real Supabase user
    let { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userInfo.email,
      email_confirm: true,
      user_metadata: {
        full_name: userInfo.name,
        avatar_url: userInfo.picture,
        provider: 'google'
      }
    });

    // If user already exists, get them
    if (authError && authError.message.includes('already registered')) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      authUser = existingUsers.users.find(u => u.email === userInfo.email) || null;
    }

    if (!authUser || !authUser.user) {
      return Response.redirect(new URL('/auth/error?error=user_creation_failed', request.url));
    }

    const realUserId = authUser.user.id; // This is a real UUID!

    // FIXED: Create or update profile with real UUID
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: realUserId, // Real UUID from Supabase auth
        email: userInfo.email,
        full_name: userInfo.name,
        avatar_url: userInfo.picture,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
    }

    // Create session data with REAL UUID
    const sessionData = {
      userId: realUserId, // ✅ Real UUID instead of fake ID
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

    console.log('✅ User created/found with real UUID:', realUserId);
    return response;

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return Response.redirect(new URL('/auth/error?error=unexpected_error', request.url));
  }
}