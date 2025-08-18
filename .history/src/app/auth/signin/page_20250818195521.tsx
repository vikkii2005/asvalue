// src/app/auth/signin/page.tsx
// FIXED - Multiple strategies to force account selection

'use client'

import { useEffect, useState } from 'react'
import { generateState, storeState } from '@/lib/auth/state'
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/auth/pkce'

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null)
  const [showAccountPicker, setShowAccountPicker] = useState(false)

  useEffect(() => {
    async function initiateOAuth() {
      try {
        console.log('🚀 Starting Google OAuth with FORCED account selection...')

        // Generate OAuth state and PKCE
        const state = generateState()
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)

        await storeState(state, codeVerifier)

        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!googleClientId) {
          throw new Error('Google Client ID not found')
        }

        // ✅ MULTIPLE METHODS to force account selection
        const params = new URLSearchParams({
          client_id: googleClientId,
          redirect_uri: window.location.origin + '/auth/callback',
          response_type: 'code',
          scope: 'openid email profile',
          state: state,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          access_type: 'offline',
          prompt: 'select_account consent', // Force account selection
          include_granted_scopes: 'false', // Don't auto-grant
          login_hint: '', // Clear any login hints
          hd: '', // Clear hosted domain
          approval_prompt: 'force', // Legacy parameter for older systems
        })

        // ✅ Add timestamp to prevent caching
        params.append('timestamp', Date.now().toString())
        
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

        console.log('🔄 Redirecting with forced account selection...')
        
        // ✅ Clear Google's OAuth cookies first (if possible)
        try {
          // This won't work due to CORS but shows intent
          document.cookie = 'SAPISID=; domain=.google.com; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        } catch (e) {
          // Expected to fail due to CORS, but trying anyway
        }
        
        setShowAccountPicker(true)
        
        // Small delay to show message
        setTimeout(() => {
          window.location.href = oauthUrl
        }, 1000)
        
      } catch (err: unknown) {
        console.error('❌ OAuth Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      }
    }

    initiateOAuth()
  }, [])

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4'>
        <div className='bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center'>
          <div className='text-6xl mb-4'>⚠️</div>
          <h2 className='text-xl font-bold text-red-600 mb-4'>Authentication Error</h2>
          <p className='text-gray-700 mb-6'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition'
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center'>
        {showAccountPicker ? (
          <>
            <div className='mb-4 text-6xl'>👥</div>
            <h1 className='mb-2 text-2xl font-bold text-gray-900'>
              Choose Your Google Account
            </h1>
            <p className='text-gray-600 mb-4'>
              Select which Google account you want to use for AsValue
            </p>
            <div className='text-sm text-blue-600'>
              Opening Google account picker...
            </div>
          </>
        ) : (
          <>
            <div className='mb-4 text-6xl'>🔐</div>
            <h1 className='mb-2 text-2xl font-bold text-gray-900'>
              Connecting to Google
            </h1>
            <p className='text-gray-600 mb-4'>
              Preparing secure sign-in with account selection...
            </p>
          </>
        )}
        
        <div className='mx-auto mt-4 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    </div>
  )
}