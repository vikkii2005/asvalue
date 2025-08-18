// src/app/auth/callback/route.ts
// DEBUG VERSION - Shows exact token exchange error

import { NextRequest } from 'next/server'
import { validateState } from '@/lib/auth/state'
import { exchangeCodeForTokens, fetchGoogleUserInfo } from '@/lib/auth/google'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for database writes
)

export async function GET(request: NextRequest) {
  console.log('🎯 OAuth callback started!')
  
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const state = requestUrl.searchParams.get('state')

    // 🔍 DEBUG: Log incoming parameters
    console.log('📊 DEBUG INFO:')
    console.log('- Request URL:', requestUrl.href)
    console.log('- Code received:', code ? 'YES' : 'NO')
    console.log('- State received:', state ? 'YES' : 'NO')
    console.log('- Environment check:')
    console.log('  - GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING')
    console.log('  - NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
    console.log('  - SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    if (!code || !state) {
      console.log('❌ Missing code or state parameter')
      return Response.redirect(
        new URL('/auth/error?error=missing_params', request.url)
      )
    }

    // Validate state
    console.log('🔍 Validating OAuth state...')
    const codeVerifier = await validateState(state)
    if (!codeVerifier) {
      console.log('❌ Invalid or expired state')
      return Response.redirect(
        new URL('/auth/error?error=invalid_state', request.url)
      )
    }
    console.log('✅ State validation passed')

    // 🔍 DEBUG: Check Google OAuth credentials before token exchange
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
    
    console.log('🔍 Google OAuth credentials check:')
    console.log('- Client ID:', googleClientId ? 'SET' : 'MISSING')
    console.log('- Client Secret:', googleClientSecret ? 'SET' : 'MISSING')
    console.log('- Client Secret starts with GOCSPX:', googleClientSecret?.startsWith('GOCSPX-') ? 'YES' : 'NO')

    // Get tokens from Google
    console.log('🔄 Starting Google token exchange...')
    const tokenResponse = await exchangeCodeForTokens(code, codeVerifier)
    
    // 🔍 DEBUG: Detailed token response logging
    console.log('🔍 Token exchange response:')
    console.log('- Has error:', tokenResponse.error ? 'YES' : 'NO')
    if (tokenResponse.error) {
      console.log('- Error details:', tokenResponse.error)
      console.log('- Error description:', tokenResponse.details)
    }
    console.log('- Has access token:', tokenResponse.access_token ? 'YES' : 'NO')

    if (tokenResponse.error) {
      console.error('❌ Token exchange failed:', tokenResponse.error)
      console.error('❌ Full error details:', tokenResponse)
      
      // Return detailed error for debugging
      return Response.redirect(
        new URL(`/auth/error?error=token_exchange_failed&details=${encodeURIComponent(tokenResponse.error + ': ' + (tokenResponse.details || 'No details'))}`, request.url)
      )
    }

    console.log('✅ Got tokens from Google successfully')

    // Get user info from Google
    const userInfo = await fetchGoogleUserInfo(tokenResponse.access_token)
    console.log('✅ Got user info from Google:', userInfo.email)

    // Generate proper UUID (will be used for new users only)
    let properUserId = randomUUID()

    // Save user to Supabase profiles table with last_sign_in
    try {
      console.log('🔍 Checking if user exists in database...')
      
      // First check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userInfo.email)
        .single();

      if (existingUser) {
        console.log('✅ Existing user found, updating...')
        
        // Update existing user with last_sign_in
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: userInfo.name,
            avatar_url: userInfo.picture,
            email_verified: true,
            last_sign_in: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('email', userInfo.email);
          
        if (profileError) {
          console.error('❌ Profile update failed:', profileError)
        } else {
          console.log('✅ Existing user updated with last_sign_in:', existingUser.id)
        }
        
        // Use existing user ID for session
        properUserId = existingUser.id;
        
      } else {
        console.log('🆕 New user, creating profile...')
        
        // Insert new user with last_sign_in
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: properUserId,
            email: userInfo.email,
            full_name: userInfo.name,
            avatar_url: userInfo.picture,
            role: null, // Will be set when they select role
            onboarding_completed: false,
            phone_verified: false,
            email_verified: true,
            last_sign_in: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('❌ Profile creation failed:', profileError)
        } else {
          console.log('✅ New user created with last_sign_in:', properUserId)
        }
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError)
    }

    // Create session data
    const sessionData = {
      userId: properUserId,
      email: userInfo.email,
      fullName: userInfo.name,
      avatarUrl: userInfo.picture,
      authenticated: true,
      timestamp: Date.now(),
    }

    const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString(
      'base64'
    )

    const redirectUrl = new URL('/auth/success', request.url)

    const response = new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
        'Set-Cookie': `asvalue-authenticated=${sessionValue}; Path=/; SameSite=Lax; Max-Age=3600`,
      },
    })

    console.log('✅ Authentication completed successfully:', properUserId)
    return response
  } catch (error) {
    console.error('❌ OAuth callback error:', error)
    
    // More detailed error logging
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('❌ Error message:', error instanceof Error ? error.message : error)
    
    return Response.redirect(
      new URL(`/auth/error?error=unexpected_error&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
    )
  }
}