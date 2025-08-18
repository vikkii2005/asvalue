// src/app/auth/signin/page.tsx
// EMERGENCY FIX - Absolute hardcoded URLs

'use client'

import { useEffect, useState } from 'react'
import { generateState, storeState } from '@/lib/auth/state'
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/auth/pkce'

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initiateOAuth() {
      try {
        const state = generateState()
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)
        await storeState(state, codeVerifier)

        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!googleClientId) {
          throw new Error('Google Client ID not found')
        }

        // 🔥 EMERGENCY FIX - ABSOLUTE HARDCODED URL
        const redirectUri = 'https://asvalue.com/auth/callback'

        console.log('🔍 BROWSER using redirect_uri:', redirectUri)

        const params = new URLSearchParams({
          client_id: googleClientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'openid email profile',
          state: state,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          access_type: 'offline',
          prompt: 'select_account consent',
        })

        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
        
        console.log('🔄 Redirecting to:', oauthUrl)
        window.location.href = oauthUrl
        
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    initiateOAuth()
  }, [])

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-xl font-bold text-red-600 mb-4'>Error: {error}</h2>
          <button onClick={() => window.location.reload()} className='bg-blue-600 text-white px-4 py-2 rounded'>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold mb-4'>Redirecting to Google...</h1>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
      </div>
    </div>
  )
}