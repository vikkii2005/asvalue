// src/lib/auth/google.ts
// FIXED - Uses consistent redirect_uri for token exchange

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
) {
  try {
    console.log('🔄 Starting Google token exchange...')

    const tokenEndpoint = 'https://oauth2.googleapis.com/token'

    // 🔧 FIXED: Use consistent redirect_uri construction
    const redirectUri = process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL}/auth/callback`
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://asvalue.com'}/auth/callback`;

    console.log('🔍 Token exchange debug:')
    console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
    console.log('- Constructed redirect_uri:', redirectUri)
    console.log('- Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
    console.log('- Client Secret exists:', !!process.env.GOOGLE_CLIENT_SECRET)

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code: code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri, // 🔧 FIXED: Use consistent redirect_uri
    })

    console.log('🌐 Making request to Google token endpoint...')
    console.log('🔍 Request parameters:', {
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_present: !!code,
      code_verifier_present: !!codeVerifier
    })

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Google token exchange failed:', data)
      return {
        error: data.error || 'token_exchange_failed',
        details: data.error_description || 'Unknown error',
      }
    }

    console.log('✅ Google token exchange successful')

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      id_token: data.id_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in || 3600,
    }
  } catch (error) {
    console.error('🚫 Token exchange error:', error)
    return {
      error: 'network_error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function fetchGoogleUserInfo(accessToken: string) {
  try {
    console.log('👤 Fetching Google user info...')

    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status}`)
    }

    const userInfo = await response.json()
    console.log('✅ Google user info fetched successfully')

    return {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      picture: userInfo.picture,
      verified_email: userInfo.verified_email || false,
    }
  } catch (error) {
    console.error('❌ Failed to fetch Google user info:', error)
    throw error
  }
}