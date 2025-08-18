// src/app/auth/error/page.tsx
// Advanced error recovery page

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type ErrorType =
  | 'oauth_cancelled'
  | 'missing_params'
  | 'invalid_state'
  | 'token_exchange_failed'
  | 'user_info_failed'
  | 'supabase_auth_failed'
  | 'unexpected_error'
  | 'network_error'
  | 'timeout_error'

interface ErrorInfo {
  title: string
  message: string
  action: string
  recoverySteps: string[]
  canRetry: boolean
}

const errorMap: Record<ErrorType, ErrorInfo> = {
  oauth_cancelled: {
    title: 'Sign-in Cancelled',
    message: 'You cancelled the Google sign-in process.',
    action: 'Try signing in again',
    recoverySteps: [
      'Click "Try Again" below',
      'Select your Google account when prompted',
      'Allow AsValue to access your account',
    ],
    canRetry: true,
  },
  missing_params: {
    title: 'Authentication Error',
    message: 'Required authentication parameters are missing.',
    action: 'Start the sign-in process again',
    recoverySteps: [
      'Return to the main page',
      'Click "Sign Up for Free" again',
      'Complete the Google authentication',
    ],
    canRetry: true,
  },
  invalid_state: {
    title: 'Security Check Failed',
    message: 'The authentication request appears to be invalid or expired.',
    action: 'Start a fresh sign-in attempt',
    recoverySteps: [
      'This is a security protection',
      'Click "Start Over" to begin again',
      'Complete authentication within 10 minutes',
    ],
    canRetry: true,
  },
  token_exchange_failed: {
    title: 'Google Authentication Failed',
    message: 'Unable to complete authentication with Google.',
    action: 'Try again or contact support',
    recoverySteps: [
      'Check your internet connection',
      'Try signing in again',
      'Contact support if problem persists',
    ],
    canRetry: true,
  },
  user_info_failed: {
    title: 'Profile Information Error',
    message: 'Unable to retrieve your profile information from Google.',
    action: 'Retry authentication',
    recoverySteps: [
      'Ensure your Google account is active',
      'Try signing in again',
      'Check Google account permissions',
    ],
    canRetry: true,
  },
  supabase_auth_failed: {
    title: 'Account Creation Failed',
    message: 'Unable to create your AsValue account.',
    action: 'Try again or contact support',
    recoverySteps: [
      'This is a temporary issue',
      'Try signing in again',
      'Contact support if error continues',
    ],
    canRetry: true,
  },
  network_error: {
    title: 'Network Connection Error',
    message: 'Unable to connect to authentication servers.',
    action: 'Check connection and retry',
    recoverySteps: [
      'Check your internet connection',
      'Try switching networks (WiFi/Mobile)',
      'Wait a moment and try again',
    ],
    canRetry: true,
  },
  timeout_error: {
    title: 'Request Timeout',
    message: 'Authentication took too long to complete.',
    action: 'Try again with better connection',
    recoverySteps: [
      'Ensure stable internet connection',
      'Close other bandwidth-heavy apps',
      'Try authentication again',
    ],
    canRetry: true,
  },
  unexpected_error: {
    title: 'Unexpected Error',
    message: 'Something unexpected happened during sign-in.',
    action: 'Try again or contact support',
    recoverySteps: [
      'This is an unusual error',
      'Try signing in again',
      'Report this issue to support',
    ],
    canRetry: true,
  },
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [errorType, setErrorType] = useState<ErrorType>('unexpected_error')
  const [errorInfo, setErrorInfo] = useState<ErrorInfo>(
    errorMap.unexpected_error
  )
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const error = searchParams.get('error') as ErrorType
    if (error && errorMap[error]) {
      setErrorType(error)
      setErrorInfo(errorMap[error])
    }
  }, [searchParams])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)

    // Track retry attempts
    console.log(
      `🔄 Auth error retry attempt #${retryCount + 1} for error: ${errorType}`
    )

    // Add delay for network/timeout errors
    if (errorType === 'network_error' || errorType === 'timeout_error') {
      setTimeout(() => {
        router.push('/auth/signin')
      }, 1000)
    } else {
      router.push('/auth/signin')
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        {/* Error Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            background: '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '40px',
          }}
        >
          ⚠️
        </div>

        {/* Error Title */}
        <h1
          style={{
            color: '#1f2937',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 15px 0',
          }}
        >
          {errorInfo.title}
        </h1>

        {/* Error Message */}
        <p
          style={{
            color: '#6b7280',
            fontSize: '18px',
            margin: '0 0 30px 0',
            lineHeight: '1.5',
          }}
        >
          {errorInfo.message}
        </p>

        {/* Recovery Steps */}
        <div
          style={{
            background: '#f9fafb',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px',
            textAlign: 'left',
          }}
        >
          <h3
            style={{
              color: '#374151',
              fontSize: '16px',
              fontWeight: 'bold',
              margin: '0 0 15px 0',
            }}
          >
            How to fix this:
          </h3>
          <ol
            style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: 0,
              paddingLeft: '20px',
            }}
          >
            {errorInfo.recoverySteps.map((step, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Retry Information */}
        {retryCount > 0 && (
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
            }}
          >
            <p
              style={{
                color: '#92400e',
                fontSize: '14px',
                margin: 0,
              }}
            >
              Retry attempt #{retryCount}. If errors persist, please contact
              support.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}
        >
          {errorInfo.canRetry && (
            <button
              onClick={handleRetry}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#2563eb'
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#3b82f6'
              }}
            >
              {retryCount > 0 ? 'Try Again' : errorInfo.action}
            </button>
          )}

          <button
            onClick={handleGoHome}
            style={{
              background: 'transparent',
              color: '#6b7280',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'medium',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = '#9ca3af'
              e.currentTarget.style.color = '#374151'
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.color = '#6b7280'
            }}
          >
            Back to Home
          </button>
        </div>

        {/* Error Code (for debugging) */}
        <div
          style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <p
            style={{
              color: '#9ca3af',
              fontSize: '12px',
              margin: 0,
            }}
          >
            Error Code: {errorType.toUpperCase()}
            {retryCount > 0 && ` | Retries: ${retryCount}`}
          </p>
        </div>
      </div>
    </div>
  )
}
