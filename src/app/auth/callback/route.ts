// src/app/auth/callback/route.ts
// FIXED - Now updates last_sign_in field

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
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const state = requestUrl.searchParams.get('state')

    console.log('🎯 OAuth callback received!')

    if (!code || !state) {
      console.log('❌ Missing code or state parameter')
      return Response.redirect(
        new URL('/auth/error?error=missing_params', request.url)
      )
    }

    // Validate state
    const codeVerifier = await validateState(state)
    if (!codeVerifier) {
      console.log('❌ Invalid or expired state')
      return Response.redirect(
        new URL('/auth/error?error=invalid_state', request.url)
      )
    }

    console.log('✅ State validation passed')

    // Get tokens from Google
    const tokenResponse = await exchangeCodeForTokens(code, codeVerifier)
    if (tokenResponse.error) {
      console.error('❌ Token exchange failed:', tokenResponse.error)
      return Response.redirect(
        new URL('/auth/error?error=token_exchange_failed', request.url)
      )
    }

    console.log('✅ Got tokens from Google successfully')

    // Get user info from Google
    const userInfo = await fetchGoogleUserInfo(tokenResponse.access_token)
    console.log('✅ Got user info from Google:', userInfo.email)

    // Generate proper UUID (will be used for new users only)
    let properUserId = randomUUID()

    // 🔧 FIXED: Save user to Supabase profiles table with last_sign_in
    try {
      // First check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userInfo.email)
        .single()

      if (existingUser) {
        // Update existing user with last_sign_in
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: userInfo.name,
            avatar_url: userInfo.picture,
            email_verified: true,
            last_sign_in: new Date().toISOString(), // ✅ FIXED: Updates last_sign_in
            updated_at: new Date().toISOString(),
          })
          .eq('email', userInfo.email)

        if (profileError) {
          console.error('❌ Profile update failed:', profileError)
        } else {
          console.log(
            '✅ Existing user updated with last_sign_in:',
            existingUser.id
          )
        }

        // Use existing user ID for session
        properUserId = existingUser.id
      } else {
        // Insert new user with last_sign_in
        const { error: profileError } = await supabase.from('profiles').insert({
          id: properUserId,
          email: userInfo.email,
          full_name: userInfo.name,
          avatar_url: userInfo.picture,
          role: null, // Will be set when they select role
          onboarding_completed: false,
          phone_verified: false,
          email_verified: true,
          last_sign_in: new Date().toISOString(), // ✅ FIXED: Sets last_sign_in for new users
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

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

    console.log(
      '✅ Authentication completed with last_sign_in update:',
      properUserId
    )
    return response
  } catch (error) {
    console.error('❌ OAuth callback error:', error)
    return Response.redirect(
      new URL('/auth/error?error=unexpected_error', request.url)
    )
  }
}
