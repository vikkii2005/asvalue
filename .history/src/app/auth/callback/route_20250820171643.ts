import { NextRequest } from 'next/server'
import { validateState } from '@/lib/auth/state'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// Initialize Supabase with service role for database writes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Token exchange function
async function exchangeCodeForTokens(code: string, codeVerifier: string, redirectUri: string) {
  try {
    console.log('🔍 Token exchange using redirect_uri:', redirectUri)

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Token exchange failed:', data)
      return { error: data.error || 'token_exchange_failed', details: data.error_description }
    }

    return { access_token: data.access_token }
  } catch (error) {
    return { error: 'network_error', details: error instanceof Error ? error.message : 'Unknown' }
  }
}

// Fetch user info function
async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user info from Google')
  }

  return response.json()
}

export async function GET(request: NextRequest) {
  console.log('🎯 OAuth callback initiated')
  
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const state = requestUrl.searchParams.get('state')
    const error = requestUrl.searchParams.get('error')

    if (error) {
      console.error('❌ Google OAuth error:', error)
      return Response.redirect(new URL(`/auth/error?error=${encodeURIComponent(error)}`, request.url))
    }

    if (!code || !state) {
      console.error('❌ Missing required OAuth parameters')
      return Response.redirect(new URL('/auth/error?error=missing_parameters', request.url))
    }

    // Validate OAuth state
    console.log('🔍 Validating OAuth state...')
    const codeVerifier = await validateState(state)
    if (!codeVerifier) {
      console.error('❌ Invalid or expired OAuth state')
      return Response.redirect(new URL('/auth/error?error=invalid_state', request.url))
    }

    console.log('✅ OAuth state validated successfully')

    // Build the same redirect URI that was used in authorization
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
    const redirectUri = `${baseUrl}/auth/callback`

    // Exchange authorization code for access token
    console.log('🔄 Exchanging code for tokens...')
    const tokenResponse = await exchangeCodeForTokens(code, codeVerifier, redirectUri)
    
    if (tokenResponse.error) {
      console.error('❌ Token exchange failed:', tokenResponse.error)
      return Response.redirect(
        new URL(`/auth/error?error=token_exchange_failed&details=${encodeURIComponent(tokenResponse.error)}`, request.url)
      )
    }

    console.log('✅ Tokens received successfully')

    // Get user information from Google
    const userInfo = await fetchGoogleUserInfo(tokenResponse.access_token!)
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

    // FIXED: Better cookie configuration
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: new URL('/auth/success', baseUrl).toString(),
        // FIXED: Non-HttpOnly cookie for client-side access + proper settings
        'Set-Cookie': `asvalue-authenticated=${sessionValue}; Path=/; SameSite=Lax; Max-Age=86400; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`,
      },
    })

    console.log('✅ Authentication completed successfully - Cookie set')
    return response

  } catch (error) {
    console.error('❌ OAuth callback error:', error)
    return Response.redirect(
      new URL(`/auth/error?error=authentication_failed&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
    )
  }
}