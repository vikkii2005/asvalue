import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateState } from '@/lib/auth/state'
import { exchangeCodeForTokens, fetchGoogleUserInfo } from '@/lib/auth/google'

export async function GET(request: NextRequest) {
  console.log('🎯 OAuth callback started!')
  
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const state = requestUrl.searchParams.get('state')

    console.log('📊 DEBUG INFO:')
    console.log('- Code received:', code ? 'YES' : 'NO')
    console.log('- State received:', state ? 'YES' : 'NO')

    if (!code || !state) {
      console.log('❌ Missing code or state parameter')
      return NextResponse.redirect(new URL('/auth/error?error=missing_params', requestUrl.origin))
    }

    // Validate state and get code verifier
    console.log('🔍 Validating OAuth state...')
    const codeVerifier = await validateState(state)
    if (!codeVerifier) {
      console.log('❌ Invalid or expired state')
      return NextResponse.redirect(new URL('/auth/error?error=invalid_state', requestUrl.origin))
    }
    console.log('✅ State validation passed')

    // Exchange code for tokens
    console.log('🔄 Starting Google token exchange...')
    const tokenResponse = await exchangeCodeForTokens(code, codeVerifier)
    
    if (tokenResponse.error) {
      console.error('❌ Token exchange failed:', tokenResponse.error)
      return NextResponse.redirect(
        new URL(`/auth/error?error=token_exchange_failed&details=${encodeURIComponent(tokenResponse.error)}`, requestUrl.origin)
      )
    }

    console.log('✅ Got tokens from Google successfully')

    // Get user info from Google
    const userInfo = await fetchGoogleUserInfo(tokenResponse.access_token)
    console.log('✅ Got user info from Google:', userInfo.email)

    // 🔥 FIX: Await cookies() properly
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Check if user exists in Supabase
    let { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userInfo.email)
      .single()

    let userId = existingUser?.id

    if (!existingUser) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert({
          email: userInfo.email,
          full_name: userInfo.name,
          avatar_url: userInfo.picture,
          email_verified: true,
          last_sign_in: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (createError) {
        console.error('❌ Profile creation failed:', createError)
        return NextResponse.redirect(new URL('/auth/error?error=profile_creation_failed', requestUrl.origin))
      }

      userId = newUser.id
      console.log('✅ New user created:', userId)
    } else {
      // Update existing user
      await supabase
        .from('profiles')
        .update({
          full_name: userInfo.name,
          avatar_url: userInfo.picture,
          email_verified: true,
          last_sign_in: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      console.log('✅ Existing user updated:', userId)
    }

    // Create session cookie
    const sessionData = {
      userId: userId,
      email: userInfo.email,
      fullName: userInfo.name,
      avatarUrl: userInfo.picture,
      authenticated: true,
      timestamp: Date.now(),
    }

    const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64')

    // Create response with session cookie
    const response = NextResponse.redirect(new URL('/onboarding/seller-setup', requestUrl.origin))
    
    response.cookies.set('asvalue-authenticated', sessionValue, {
      path: '/',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })

    console.log('✅ Authentication completed successfully:', userId)
    return response

  } catch (error) {
    console.error('❌ OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/auth/error?error=unexpected_error&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
    )
  }
}