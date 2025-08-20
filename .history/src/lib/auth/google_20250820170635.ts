interface TokenResponse {
  access_token?: string
  error?: string
  details?: string
}

interface GoogleUserInfo {
  email: string
  name: string
  picture: string
  verified_email: boolean
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  try {
    // Get the redirect URI from the current request context
    const redirectUri = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
    
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
        redirect_uri: redirectUri, // This must match exactly
        code_verifier: codeVerifier,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Token exchange response:', data)
      return {
        error: data.error || 'token_exchange_failed',
        details: data.error_description || 'Unknown error during token exchange',
      }
    }

    return { access_token: data.access_token }
  } catch (error) {
    console.error('❌ Token exchange network error:', error)
    return {
      error: 'network_error',
      details: error instanceof Error ? error.message : 'Network request failed',
    }
  }
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user info from Google')
  }

  return response.json()
}