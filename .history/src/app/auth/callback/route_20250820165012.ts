import { NextRequest } from 'next/server'
import { validateState } from '@/lib/auth/state'
import { exchangeCodeForTokens, fetchGoogleUserInfo } from '@/lib/auth/google'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// Initialize Supabase with service role for database writes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role bypasses RLS
)

export async function GET(request: NextRequest) {
  console.log('🎯 OAuth callback initiated')
  
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const state = requestUrl.searchParams.get('state')
    const error = requestUrl.searchParams.get('error')

    // Handle OAuth errors from Google
    if (error) {
      console.error('❌ Google OAuth error:', error)
      return Response.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !state) {
      console.error('❌ Missing required OAuth parameters')
      return Response.redirect(
        new URL('/auth/error?error=missing_parameters', request.url)
      )
    }

    // Validate OAuth state to prevent CSRF attacks
    console.log('🔍 Validating OAuth state...')
    const codeVerifier = await validateState(state)
    if (!codeVerifier) {
      console.error('❌ Invalid or expired OAuth state')
      return Response.redirect(
        new URL('/auth/error?error=invalid_state', request.url)
      )
    }

    console.log('✅ OAuth state validated successfully')

    // Exchange authorization code for access token
    console.log('🔄 Exchanging code for tokens...')
    const tokenResponse = await exchangeCodeForTokens(code, codeVerifier)
    
    if (tokenResponse.error) {
      console.error('❌ Token exchange failed:', tokenResponse.error)
      return Response.redirect(
        new URL(`/auth/error?error=token_exchange_failed&details=${encodeURIComponent(tokenResponse.error)}`, request.url)
      )
    }

    console.log('✅ Tokens received successfully')

    // Get user information from Google
    const userInfo = await fetchGoogleUserInfo(tokenResponse.access_token)
    if (!userInfo.email) {
      throw new Error('No email received from Google')
    }

    console.log('✅ User info received:', userInfo.email)

    // Check if user exists or create new profile
    let userId: string
    
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userInfo.email)
      .single()

    if (existingUser) {
      // Update existing user
      console.log('👤 Updating existing user:', existingUser.id)
      
      await supabase
        .from('profiles')
        .update({
          full_name: userInfo.name,
          avatar_url: userInfo.picture,
          email_verified: true,
          last_sign_in: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)

      userId = existingUser.id
    } else {
      // Create new user
      userId = randomUUID()
      console.log('🆕 Creating new user:', userId)
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userInfo.email,
          full_name: userInfo.name,
          avatar_url: userInfo.picture,
          email_verified: true,
          last_sign_in: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('❌ Profile creation failed:', insertError)
        throw new Error('Failed to create user profile')
      }
    }

    // Create session data
    const sessionData = {
      userId: userId,
      email: userInfo.email,
      fullName: userInfo.name,
      avatarUrl: userInfo.picture,
      authenticated: true,
      timestamp: Date.now(),
    }

    const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64')

    // Redirect to success page with session cookie
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: new URL('/auth/success', request.url).toString(),
        'Set-Cookie': `asvalue-authenticated=${sessionValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`, // 24 hours
      },
    })

    console.log('✅ Authentication completed successfully')
    return response

  } catch (error) {
    console.error('❌ OAuth callback error:', error)
    return Response.redirect(
      new URL(`/auth/error?error=authentication_failed&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
    )
  }
}