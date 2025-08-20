'use client'

import { useEffect, useState } from 'react'
import { generateState, storeState } from '@/lib/auth/state'
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/auth/pkce'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initiateGoogleOAuth() {
      try {
        setIsLoading(true)
        
        // Generate OAuth security parameters
        const state = generateState()
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)
        
        // Store state securely for validation
        await storeState(state, codeVerifier)

        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!googleClientId) {
          throw new Error('Google Client ID not configured')
        }

        // Production redirect URI
        const redirectUri = `${window.location.origin}/auth/callback`
        
        console.log('🔄 Initiating Google OAuth with redirect:', redirectUri)

        const params = new URLSearchParams({
          client_id: googleClientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'openid email profile',
          state: state,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          access_type: 'offline',
          prompt: 'select_account',
        })

        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
        
        // Redirect to Google
        window.location.href = oauthUrl
        
      } catch (err) {
        console.error('❌ OAuth initiation failed:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
        setIsLoading(false)
      }
    }

    initiateGoogleOAuth()
  }, [])

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center max-w-md mx-auto px-4'>
          <div className='mb-4 text-6xl'>❌</div>
          <h1 className='text-2xl font-bold text-red-600 mb-4'>Authentication Error</h1>
          <p className='text-gray-700 mb-6'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center max-w-md mx-auto px-4'>
        <div className='mb-4 text-6xl'>🔄</div>
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>
          Connecting to Google...
        </h1>
        <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600 mb-4'></div>
        <p className='text-gray-600'>
          You'll be redirected to Google to sign in securely
        </p>
      </div>
    </div>
  )
}