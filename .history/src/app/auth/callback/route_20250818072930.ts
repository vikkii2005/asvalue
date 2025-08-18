// src/app/auth/callback/route.ts
// OAuth callback handler - processes Google OAuth response

import { NextRequest, NextResponse } from 'next/server';
import { validateState } from '@/lib/auth/state';
import { validatePKCE } from '@/lib/auth/pkce';
import { supabaseClient } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  console.log('🎯 OAuth callback received!');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check if user cancelled or error occurred
    if (error) {
      console.log('❌ OAuth error:', error);
      return NextResponse.redirect(
        new URL('/auth/signin?error=oauth_cancelled', request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      console.log('❌ Missing code or state parameter');
      return NextResponse.redirect(
        new URL('/auth/signin?error=missing_params', request.url)
      );
    }

    console.log('✅ Got code and state from Google');

    // Validate state and get code verifier (our security check!)
    const codeVerifier = await validateState(state);
    if (!codeVerifier) {
      console.log('❌ Invalid or expired state parameter');
      return NextResponse.redirect(
        new URL('/auth/signin?error=invalid_state', request.url)
      );
    }

    console.log('✅ State validation passed');

    // Exchange authorization code for tokens with Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: new URL('/auth/callback', request.url).toString(),
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      console.log('❌ Token exchange failed');
      const errorData = await tokenResponse.text();
      console.error('Token error:', errorData);
      return NextResponse.redirect(
        new URL('/auth/signin?error=token_exchange_failed', request.url)
      );
    }

    const tokens = await tokenResponse.json();
    console.log('✅ Got tokens from Google');

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.log('❌ Failed to get user info from Google');
      return NextResponse.redirect(
        new URL('/auth/signin?error=user_info_failed', request.url)
      );
    }

    const googleUser = await userResponse.json();
    console.log('✅ Got user info from Google');

    // Create or update user in Supabase
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithIdToken({
      provider: 'google',
      token: tokens.id_token,
    });

    if (authError || !authData.user) {
      console.log('❌ Supabase auth failed:', authError);
      return NextResponse.redirect(
        new URL('/auth/signin?error=supabase_auth_failed', request.url)
      );
    }

    console.log('✅ User authenticated with Supabase');

    // Check if user profile exists, if not create it
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single();

    if (!existingProfile) {
      console.log('🆕 Creating new user profile');
      
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: googleUser.name || '',
          email: googleUser.email || '',
          avatar_url: googleUser.picture || '',
          email_verified: googleUser.verified_email || false,
          last_sign_in: new Date().toISOString(),
        });

      if (profileError) {
        console.log('❌ Failed to create profile:', profileError);
        // Don't fail the whole process, just log the error
      } else {
        console.log('✅ Created new user profile');
      }
    } else {
      console.log('✅ User profile already exists');
      
      // Update last sign in
      await supabaseClient
        .from('profiles')
        .update({ last_sign_in: new Date().toISOString() })
        .eq('id', authData.user.id);
    }

    // Log successful authentication
    await supabaseClient
      .from('auth_audit_log')
      .insert({
        user_id: authData.user.id,
        event_type: 'signin',
        ip_address: request.ip || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        success: true,
      });

    console.log('🎉 OAuth flow completed successfully!');

    // Create the response with session
    const response = NextResponse.redirect(new URL('/auth/success', request.url));
    
    // Set session cookies
    if (authData.session) {
      response.cookies.set('sb-access-token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      
      response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;

  } catch (error: unknown) {
    console.error('💥 Unexpected error in OAuth callback:', error);
    
    // Log the error
    await supabaseClient
      .from('auth_audit_log')
      .insert({
        event_type: 'signin',
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

    return NextResponse.redirect(
      new URL('/auth/signin?error=unexpected_error', request.url)
    );
  }
}