// src/app/auth/callback/route.ts
// FIXED - Use Supabase's built-in session handling

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    console.log('🎯 OAuth callback received!');

    if (!code) {
      console.log('❌ No authorization code received');
      return Response.redirect(new URL('/auth/signin?error=no_code', request.url));
    }

    console.log('✅ Got authorization code from Google');

    // Use Supabase's built-in code exchange
    const supabaseAdmin = createAdminClient();
    
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('❌ Session exchange failed:', error);
      return Response.redirect(new URL('/auth/signin?error=session_failed', request.url));
    }

    console.log('✅ Session created successfully');

    // Get user info
    const user = data.user;
    if (!user) {
      console.error('❌ No user in session');
      return Response.redirect(new URL('/auth/signin?error=no_user', request.url));
    }

    // Check if profile exists, create if needed
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      console.log('🆕 Creating user profile');
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
          email_verified: true,
          last_sign_in: new Date().toISOString(),
        });
    } else {
      console.log('✅ Updating existing profile');
      await supabaseAdmin
        .from('profiles')
        .update({ last_sign_in: new Date().toISOString() })
        .eq('id', user.id);
    }

    // Check if user has role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let redirectUrl;
    if (profile?.role) {
      // Existing user with role
      redirectUrl = profile.role === 'seller' ? '/dashboard/seller' : '/marketplace';
      console.log(`✅ Redirecting existing ${profile.role} to ${redirectUrl}`);
    } else {
      // New user needs role selection
      redirectUrl = '/onboarding/role-selection';
      console.log('🆕 New user - redirecting to role selection');
    }

    // Create simple session cookie for our middleware
    const response = Response.redirect(new URL(redirectUrl, request.url));
    
    const sessionData = {
      userId: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name,
      authenticated: true,
      timestamp: Date.now()
    };

    const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    response.headers.append('Set-Cookie', `asvalue-authenticated=${sessionValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`);

    console.log('🎉 Authentication completed successfully');
    return response;

  } catch (error) {
    console.error('❌ Callback error:', error);
    return Response.redirect(new URL('/auth/signin?error=callback_failed', request.url));
  }
}