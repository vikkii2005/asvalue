// src/app/auth/callback/route.ts
// Fixed - Next.js 15 compatible callback using proper admin client

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/config';
import { validateState } from '@/lib/auth/state';
import { logAuthEvent } from '@/lib/auth/audit-logging';
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

    console.log('✅ Got code and state from Google');

    // Validate OAuth state for CSRF protection
    const codeVerifier = await validateState(state);
    if (!codeVerifier) {
      console.log('❌ Invalid or expired state');
      return Response.redirect(new URL('/auth/error?error=invalid_state', request.url));
    }

    console.log('✅ State validation passed');

    // ✅ FIXED: Create admin client only server-side when needed
    const supabaseAdmin = createAdminClient();

    // Exchange code for tokens using our Google utility
    console.log('🔄 Exchanging code for tokens...');
    const tokenResponse = await exchangeCodeForTokens(code, codeVerifier);
    
    if (tokenResponse.error) {
      console.error('❌ Token exchange failed:', tokenResponse.error);
      return Response.redirect(new URL('/auth/error?error=token_exchange_failed', request.url));
    }

    console.log('✅ Got tokens from Google');

    // Get user info from Google
    const userInfo = await fetchGoogleUserInfo(tokenResponse.access_token);
    console.log('✅ Got user info from Google');

    // Create or update user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userInfo.email,
      user_metadata: {
        full_name: userInfo.name,
        avatar_url: userInfo.picture,
        provider: 'google',
        email_verified: userInfo.verified_email,
      },
      email_confirm: true,
    });

    if (authError && !authError.message.includes('already registered')) {
      console.error('❌ Supabase user creation failed:', authError);
      return Response.redirect(new URL('/auth/error?error=supabase_auth_failed', request.url));
    }

    // Get or create the user (handle existing users)
    let user = authData?.user;
    if (!user) {
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(userInfo.id);
      user = existingUser?.user || null;
    }

    if (!user) {
      // Try to get user by email
      const { data: emailUser } = await supabaseAdmin
        .from('auth.users')
        .select('*')
        .eq('email', userInfo.email)
        .single();
      
      user = emailUser;
    }

    if (!user) {
      console.error('❌ Unable to create or find user');
      return Response.redirect(new URL('/auth/error?error=user_creation_failed', request.url));
    }

    console.log('✅ User authenticated with Supabase');

    // Check if user profile exists, create if needed
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      console.log('🆕 Creating new user profile');
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          email: userInfo.email,
          full_name: userInfo.name,
          avatar_url: userInfo.picture,
          email_verified: userInfo.verified_email,
          last_sign_in: new Date().toISOString(),
        });

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
      } else {
        console.log('✅ User profile created');
      }
    } else {
      console.log('✅ User profile already exists');
      // Update last sign-in time
      await supabaseAdmin
        .from('profiles')
        .update({ last_sign_in: new Date().toISOString() })
        .eq('id', user.id);
    }

    // Create a session token for the user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
    });

    if (sessionError) {
      console.error('❌ Session generation failed:', sessionError);
    }

    // Log successful authentication
    await logAuthEvent({
      userId: user.id,
      eventType: 'signin',
      success: true,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    console.log('🎉 OAuth flow completed successfully!');

    // Create response with session cookie
    const response = Response.redirect(new URL('/auth/success', request.url));
    
    // Set session cookie manually for Next.js 15 compatibility
    if (sessionData?.properties?.action_link) {
      const url = new URL(sessionData.properties.action_link);
      const token = url.searchParams.get('token');
      if (token) {
        response.headers.set('Set-Cookie', `sb-access-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`);
      }
    }

    return response;

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    
    await logAuthEvent({
      eventType: 'failure',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown callback error',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return Response.redirect(new URL('/auth/error?error=unexpected_error', request.url));
  }
}