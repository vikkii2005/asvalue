// src/app/auth/callback/route.ts
// FIXED - Immutable headers workaround with new Response creation

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
    console.log(`🔑 Using code verifier: ${codeVerifier.substring(0, 10)}...`);

    // Create admin client
    const supabaseAdmin = createAdminClient();

    // Exchange code for tokens
    console.log('🔄 Exchanging code for tokens...');
    const tokenResponse = await exchangeCodeForTokens(code, codeVerifier);
    
    if (tokenResponse.error) {
      console.error('❌ Token exchange failed:', tokenResponse.error);
      console.error('📋 Token exchange details:', tokenResponse.details);
      return Response.redirect(new URL('/auth/error?error=token_exchange_failed', request.url));
    }

    console.log('✅ Got tokens from Google successfully');

    // Get user info from Google
    const userInfo = await fetchGoogleUserInfo(tokenResponse.access_token);
    console.log('✅ Got user info from Google:', userInfo.email);

    // Create or get user in Supabase Auth
    let user = null;
    
    // Try to create new user
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

    if (authError && authError.message.includes('already registered')) {
      console.log('👤 User already exists, finding existing user...');
      
      // User exists, find them by email  
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (!listError && users) {
        const existingUser = users.find(u => u.email === userInfo.email);
        if (existingUser) {
          user = existingUser;
          console.log('✅ Found existing user');
        }
      }
    } else if (!authError && authData?.user) {
      user = authData.user;
      console.log('✅ Created new user');
    }

    if (!user) {
      console.error('❌ Unable to create or find user');
      return Response.redirect(new URL('/auth/error?error=user_creation_failed', request.url));
    }

    console.log('✅ User authenticated with Supabase');

    // Create or update user profile
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      console.log('🆕 Creating new user profile');
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          email: userInfo.email,
          full_name: userInfo.name,
          avatar_url: userInfo.picture,
          email_verified: userInfo.verified_email,
          last_sign_in: new Date().toISOString(),
        });
      console.log('✅ User profile created');
    } else {
      console.log('✅ User profile exists, updating last sign-in');
      await supabaseAdmin
        .from('profiles')
        .update({ last_sign_in: new Date().toISOString() })
        .eq('id', user.id);
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

    // Check if user has role for smart redirect
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let redirectUrl;
    if (profile?.role) {
      if (profile.role === 'seller') {
        redirectUrl = '/dashboard/seller';
      } else {
        redirectUrl = '/marketplace';
      }
      console.log(`✅ Existing ${profile.role} - redirecting to ${redirectUrl}`);
    } else {
      redirectUrl = '/onboarding/role-selection';
      console.log('🆕 New user - redirecting to role selection');
    }

    // *** FIXED: Create response with cookie using new Response constructor ***
    const sessionData = {
      userId: user.id,
      email: userInfo.email,
      fullName: userInfo.name,
      avatarUrl: userInfo.picture,
      authenticated: true,
      timestamp: Date.now()
    };

    const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    
    // Create redirect response with cookie - FIXED METHOD
    const redirectResponse = Response.redirect(new URL(redirectUrl, request.url));
    
    // Create new response to avoid immutable headers issue
    const newResponse = new Response(redirectResponse.body, {
      status: redirectResponse.status,
      statusText: redirectResponse.statusText,
      headers: {
        ...Object.fromEntries(redirectResponse.headers.entries()),
        'Set-Cookie': `asvalue-authenticated=${sessionValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`,
      },
    });

    console.log('✅ Authentication cookie set - redirecting to:', redirectUrl);
    return newResponse;

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    
    try {
      await logAuthEvent({
        eventType: 'failure',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown callback error',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    } catch (logError) {
      console.error('Failed to log auth event:', logError);
    }

    return Response.redirect(new URL('/auth/error?error=unexpected_error', request.url));
  }
}