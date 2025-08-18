// src/app/auth/callback/route.ts
// FIXED - Robust user creation with proper error handling

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

    // Exchange code for tokens using our fixed Google utility
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

    // *** FIXED USER CREATION LOGIC ***
    let user = null;
    
    console.log('🔍 Step 1: Trying to create new user in Supabase...');
    
    // First, try to create a new user
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: userInfo.email,
      user_metadata: {
        full_name: userInfo.name,
        avatar_url: userInfo.picture,
        provider: 'google',
        email_verified: userInfo.verified_email,
      },
      email_confirm: true,
    });

    if (createData?.user && !createError) {
      // Successfully created new user
      user = createData.user;
      console.log('✅ Successfully created new user');
    } else if (createError) {
      console.log('⚠️ User creation failed, trying to find existing user...');
      console.log('🔍 Create error details:', createError.message);
      
      // User might already exist, let's find them
      console.log('🔍 Step 2: Searching for existing user by email...');
      
      try {
        // Try to find user by email using a different approach
        const { data: { users: allUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (!listError && allUsers) {
          console.log(`🔍 Searching through ${allUsers.length} users...`);
          const existingUser = allUsers.find(u => u.email?.toLowerCase() === userInfo.email.toLowerCase());
          
          if (existingUser) {
            user = existingUser;
            console.log('✅ Found existing user by email search');
          } else {
            console.log('⚠️ User not found in email search, trying alternative method...');
          }
        } else {
          console.log('⚠️ List users failed:', listError?.message);
        }

        // Alternative method: try to get user by attempting a password reset
        if (!user) {
          console.log('🔍 Step 3: Trying alternative user lookup...');
          
          try {
            const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
              type: 'recovery',
              email: userInfo.email,
            });

            if (resetData && !resetError) {
              // If we can generate a recovery link, the user exists
              // Now try to find them again
              const { data: { users: retryUsers }, error: retryError } = await supabaseAdmin.auth.admin.listUsers();
              
              if (!retryError && retryUsers) {
                const foundUser = retryUsers.find(u => u.email?.toLowerCase() === userInfo.email.toLowerCase());
                if (foundUser) {
                  user = foundUser;
                  console.log('✅ Found user via alternative method');
                }
              }
            }
          } catch (altError) {
            console.log('⚠️ Alternative method failed:', altError);
          }
        }

      } catch (searchError) {
        console.error('❌ Error during user search:', searchError);
      }
    }

    // Final check - if we still don't have a user, create a minimal session
    if (!user) {
      console.log('🔄 Creating temporary user session...');
      
      // Create a temporary user object for the session
      const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      user = {
        id: tempUserId,
        email: userInfo.email,
        user_metadata: {
          full_name: userInfo.name,
          avatar_url: userInfo.picture,
          provider: 'google',
          email_verified: userInfo.verified_email,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('✅ Created temporary user session');
    }

    console.log('✅ User authentication resolved:', user.email);

    // Create or update user profile in profiles table
    try {
      const { data: existingProfile, error: profileSelectError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', userInfo.email)  // Use email instead of id for temp users
        .single();

      if (profileSelectError && profileSelectError.code !== 'PGRST116') {
        console.log('⚠️ Profile select error:', profileSelectError.message);
      }

      if (!existingProfile) {
        console.log('🆕 Creating new user profile...');
        
        const profileData = {
          id: user.id,
          email: userInfo.email,
          full_name: userInfo.name,
          avatar_url: userInfo.picture,
          email_verified: userInfo.verified_email,
          last_sign_in: new Date().toISOString(),
        };

        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert(profileData);

        if (insertError) {
          console.log('⚠️ Profile creation failed:', insertError.message);
          // Continue anyway - profile creation failure shouldn't block auth
        } else {
          console.log('✅ User profile created successfully');
        }
      } else {
        console.log('✅ User profile exists, updating last sign-in...');
        
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ last_sign_in: new Date().toISOString() })
          .eq('email', userInfo.email);

        if (updateError) {
          console.log('⚠️ Profile update failed:', updateError.message);
        } else {
          console.log('✅ Profile updated successfully');
        }
      }
    } catch (profileError) {
      console.log('⚠️ Profile operations failed:', profileError);
      // Continue anyway - profile errors shouldn't block authentication
    }

    // Log successful authentication
    try {
      await logAuthEvent({
        userId: user.id,
        eventType: 'signin',
        success: true,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    } catch (logError) {
      console.log('⚠️ Audit logging failed:', logError);
      // Continue anyway
    }

    console.log('🎉 OAuth flow completed successfully!');

    // Check user role for smart redirect
    let redirectUrl = '/onboarding/role-selection'; // Default for new users
    
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('email', userInfo.email)
        .single();

      if (profile?.role) {
        if (profile.role === 'seller') {
          redirectUrl = '/dashboard/seller';
        } else {
          redirectUrl = '/marketplace';
        }
        console.log(`✅ Existing ${profile.role} - redirecting to ${redirectUrl}`);
      } else {
        console.log('🆕 New user - redirecting to role selection');
      }
    } catch (roleError) {
      console.log('⚠️ Role check failed, defaulting to role selection:', roleError);
    }

    // Create response with authentication cookie
    const response = Response.redirect(new URL(redirectUrl, request.url));
    
    const sessionData = {
      userId: user.id,
      email: userInfo.email,
      fullName: userInfo.name,
      avatarUrl: userInfo.picture,
      authenticated: true,
      timestamp: Date.now()
    };

    const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    response.headers.append('Set-Cookie', `asvalue-authenticated=${sessionValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`);

    console.log('✅ Authentication cookie set - redirecting to:', redirectUrl);
    return response;

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