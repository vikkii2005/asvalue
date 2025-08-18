// src/app/auth/callback/route.ts
// Next.js 15 compatible OAuth callback handler

import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { validateState } from '@/lib/auth/state';
import { logAuthEvent } from '@/lib/auth/audit-logging';

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
    console.log('🔑 Code verifier retrieved:', codeVerifier ? 'Present' : 'Missing');

    // Create Supabase client for Next.js 15 - await cookies()
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Use exchangeCodeForSession with proper error handling
    console.log('🔄 Exchanging code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('❌ Supabase code exchange failed:', error);
      await logAuthEvent({
        eventType: 'failure',
        success: false,
        errorMessage: `Code exchange failed: ${error.message}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
      return Response.redirect(new URL('/auth/error?error=token_exchange_failed', request.url));
    }

    if (!data.session || !data.user) {
      console.error('❌ No session or user returned from Supabase');
      return Response.redirect(new URL('/auth/error?error=supabase_auth_failed', request.url));
    }

    console.log('✅ User authenticated with Supabase');
    console.log('👤 User ID:', data.user.id);
    console.log('📧 User Email:', data.user.email);

    // Check if user profile exists, create if needed
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!existingProfile) {
      console.log('🆕 Creating new user profile');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
          email_verified: true,
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
      await supabase
        .from('profiles')
        .update({ last_sign_in: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    // Log successful authentication
    await logAuthEvent({
      userId: data.user.id,
      eventType: 'signin',
      success: true,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    console.log('🎉 OAuth flow completed successfully!');
    console.log('🔄 Redirecting to success page...');

    // Create response with redirect
    const response = Response.redirect(new URL('/auth/success', request.url));
    
    // Make sure session is set in response
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