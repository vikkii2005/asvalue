// src/components/auth/signin-redirect.tsx
// Enhanced redirect component with cross-screen analytics tracking

'use client';

import { useEffect, useState } from 'react';
import { generateState, storeState } from '@/lib/auth/state';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/auth/pkce';

interface AuthError {
  message: string;
  code?: string;
  type: 'network' | 'config' | 'security' | 'unknown';
}

interface SignInRedirectProps {
  redirectTo?: string;
  onError?: (error: AuthError) => void;
  showLoadingText?: boolean;
  className?: string;
  enableAnalytics?: boolean;
  sessionId?: string;
}

export default function SignInRedirect({
  redirectTo = '/auth/success',
  onError,
  showLoadingText = true,
  className = '',
  enableAnalytics = true,
  sessionId
}: SignInRedirectProps) {
  const [error, setError] = useState<AuthError | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [analyticsSessionId] = useState(() => 
    sessionId || `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Initialize cross-screen session tracking
  useEffect(() => {
    if (enableAnalytics) {
      console.log(`📊 Analytics session started: ${analyticsSessionId}`);
      
      // Store session for cross-screen tracking
      localStorage.setItem('asvalue_auth_session', JSON.stringify({
        sessionId: analyticsSessionId,
        startTime: Date.now(),
        step: 'redirect_init'
      }));
    }
  }, [analyticsSessionId, enableAnalytics]);

  useEffect(() => {
    async function initiateOAuth() {
      const startTime = performance.now();
      
      try {
        setIsRedirecting(true);
        
        if (enableAnalytics) {
          console.log('🔄 OAuth redirect timing started');
        }

        // Generate OAuth state (CSRF protection)
        const state = generateState();
        console.log('✅ Generated security state');

        // Generate PKCE code verifier and challenge
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        console.log('✅ Generated PKCE codes');

        // Store state and verifier securely
        await storeState(state, codeVerifier);
        console.log('✅ Stored security codes in database');

        // Validate Google Client ID
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!googleClientId) {
          throw {
            message: 'Google Client ID not configured',
            code: 'MISSING_CLIENT_ID',
            type: 'config'
          } as AuthError;
        }

        // Build Google OAuth URL with security parameters
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

        // Record timing milestone
        if (enableAnalytics) {
          const processingTime = performance.now() - startTime;
          console.log(`⚡ OAuth preparation completed in ${processingTime.toFixed(2)}ms`);
          
          // Update analytics session
          const authSession = JSON.parse(localStorage.getItem('asvalue_auth_session') || '{}');
          authSession.preparationTime = processingTime;
          authSession.step = 'redirect_ready';
          localStorage.setItem('asvalue_auth_session', JSON.stringify(authSession));
        }

        console.log('🚀 Redirecting to Google OAuth...');
        
        // IMMEDIATE redirect to Google
        window.location.href = oauthUrl;

      } catch (err: unknown) {
        const authError: AuthError = err instanceof Error 
          ? {
              message: err.message,
              type: err.message.includes('network') || err.message.includes('fetch') ? 'network' : 'unknown'
            }
          : {
              message: 'Unknown error during OAuth initialization',
              type: 'unknown'
            };

        console.error('❌ OAuth initialization failed:', authError);
        
        // Record error in analytics
        if (enableAnalytics) {
          const authSession = JSON.parse(localStorage.getItem('asvalue_auth_session') || '{}');
          authSession.error = authError;
          authSession.step = 'redirect_failed';
          localStorage.setItem('asvalue_auth_session', JSON.stringify(authSession));
        }
        
        setError(authError);
        if (onError) {
          onError(authError);
        }
      } finally {
        setIsRedirecting(false);
      }
    }

    // Small delay to ensure component is mounted
    const timer = setTimeout(initiateOAuth, 100);
    return () => clearTimeout(timer);
  }, [redirectTo, onError, enableAnalytics]);

  // Error Recovery Component
  if (error) {
    return (
      <div className={`auth-error-container ${className}`} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#fee2e2',
        borderRadius: '12px',
        border: '1px solid #fecaca',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          ⚠️
        </div>
        
        <h3 style={{
          color: '#dc2626',
          margin: '0 0 12px 0',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Authentication Error
        </h3>
        
        <p style={{
          color: '#7f1d1d',
          margin: '0 0 20px 0',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          {error.message}
        </p>

        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'medium'
          }}
        >
          🔄 Try Again
        </button>

        {enableAnalytics && (
          <div style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginTop: '16px'
          }}>
            Session: {analyticsSessionId.slice(-8)}
          </div>
        )}
      </div>
    );
  }

  // Loading Component
  return (
    <div className={`signin-redirect-container ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      {/* Loading Spinner */}
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }} />

      {/* Loading Text */}
      {showLoadingText && (
        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: '#374151',
            fontSize: '16px',
            fontWeight: 'medium',
            margin: '0 0 8px 0'
          }}>
            {isRedirecting ? 'Redirecting to Google...' : 'Preparing secure sign-in...'}
          </p>
          
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0
          }}>
            🔐 Secured with enterprise-grade encryption
          </p>
        </div>
      )}

      {/* Background Performance Tracking (invisible to user) */}
      {enableAnalytics && (
        <div style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          fontSize: '1px'
        }}>
          Session: {analyticsSessionId}
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}