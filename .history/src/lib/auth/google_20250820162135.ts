export async function exchangeCodeForTokens(code: string, codeVerifier: string) {
  try {
    // 🔥 FIXED: Dynamic redirect URI - get from environment or window
    const redirectUri = typeof window !== 'undefined' 
      ? window.location.origin + '/auth/callback'
      : (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/auth/callback'

    console.log('🔍 SERVER using redirect_uri:', redirectUri)

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    })

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Token exchange failed:', data)
      return { error: data.error, details: data.error_description }
    }

    console.log('✅ Token exchange successful!')
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      id_token: data.id_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in || 3600,
    }
  } catch (error) {
    console.error('🚫 Network error:', error)
    return { error: 'network_error', details: 'Connection failed' }
  }
}

export async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return response.json()
}