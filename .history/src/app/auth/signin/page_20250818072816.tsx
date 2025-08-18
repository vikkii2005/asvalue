// src/app/auth/signin/page.tsx
// Main sign-in page with immediate Google OAuth redirect

'use client';

import { useEffect, useState } from 'react';
import { generateState, storeState } from '@/lib/auth/state';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/auth/pkce';

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initiateOAuth() {
      try {
        console.log('🚀 Starting Google OAuth flow...');
        
        // Generate OAuth state (our security guard code)
        const state = generateState();
        console.log('✅ Generated security state');

        // Generate PKCE code verifier and challenge (our secret encoder)
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        console.log('✅ Generated PKCE codes');

        // Store state and verifier securely in database
        await storeState(state, codeVerifier);
        console.log('✅ Stored security codes in database');

        // Get Google Client ID from environment
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!googleClientId) {
          throw new Error('Google Client ID not found in environment variables');
        }

        // Build Google OAuth URL with all security parameters
        const params = new URLSearchParams({
          client_id: googleClientId,
          redirect_uri: window.location.origin + '/auth/callback',
          response_type: 'code',
          scope: 'openid email profile',
          state: state,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          access_type: 'offline',
          prompt: 'select_account',
        });

        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        console.log('✅ Built Google OAuth URL');

        // Small delay to show loading message, then redirect
        setTimeout(() => {
          console.log('🔄 Redirecting to Google...');
          window.location.href = oauthUrl;
        }, 1500);

      } catch (err: unknown) {
        console.error('❌ OAuth Error:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unknown error occurred');
        }
      }
    }

    initiateOAuth();
  }, []);

  // Show error screen if something went wrong
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ 
          background: '#fee2e2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px', 
          padding: '20px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>
            ⚠️ Oops! Something went wrong
          </h2>
          <p style={{ color: '#7f1d1d', margin: '0 0 20px 0' }}>
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading screen while redirecting to Google
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ 
            color: '#1f2937', 
            margin: '0 0 10px 0',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            🚀 AsValue
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
            Connecting you to Google...
          </p>
        </div>
        
        <div style={{ margin: '30px 0' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        
        <div style={{ 
          background: '#f9fafb', 
          borderRadius: '8px', 
          padding: '15px',
          marginTop: '20px'
        }}>
          <p style={{ 
            color: '#374151', 
            margin: 0, 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span>🔐</span>
            Secure sign-in with Google
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}