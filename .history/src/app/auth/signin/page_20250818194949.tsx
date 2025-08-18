// src/app/auth/signin/page.tsx
// FIXED - Always force Google account selection

'use client'

import { useEffect, useState } from 'react'
import { generateState, storeState } from '@/lib/auth/state'
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/auth/pkce'

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initiateOAuth() {
      try {
        console.log('🚀 Starting Google OAuth with forced account selection...')

        // Generate OAuth state (our security guard code)
        const state = generateState()

        // Generate PKCE code verifier and challenge (our secret encoder)
        const codeVerifier = generateCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)

        // Store state and verifier securely in database
        await storeState(state, codeVerifier)

        // Get Google Client ID from environment
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!googleClientId) {
          throw new Error('Google Client ID not found in environment variables')
        }

        // Build Google OAuth URL with FORCED account selection
        const params = new URLSearchParams({
          client_id: googleClientId,
          redirect_uri: window.location.origin + '/auth/callback',
          response_type: 'code',
          scope: 'openid email profile',
          state: state,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          access_type: 'offline',
          prompt: 'select_account consent', // ✅ FIXED: Always force account selection
          include_granted_scopes: 'false', // ✅ FIXED: Don't auto-grant permissions
        })

        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

        console.log('🔄 Redirecting to Google with forced account selection...')
        window.location.href = oauthUrl
      } catch (err: unknown) {
        console.error('❌ OAuth Error:', err)
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Unknown error occurred')
        }
      }
    }

    initiateOAuth()
  }, [])

  // Only show error if something goes wrong
  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '400px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>
            ⚠️ Oops! Something went wrong
          </h2>
          <p style={{ color: '#7f1d1d', margin: '0 0 20px 0' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show minimal loading while processing
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          🔄 Redirecting to Google account selection...
        </p>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}