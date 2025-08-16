'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages = {
    AccessDenied: {
      title: 'Access Denied',
      description: 'Sorry, we couldn\'t complete your sign-in. This usually happens when account creation fails or access is restricted.',
      suggestion: 'Please try signing in again or contact support if this persists.'
    },
    Configuration: {
      title: 'Configuration Error',
      description: 'There\'s a configuration issue with our authentication system.',
      suggestion: 'Please try again later or contact our support team.'
    },
    Verification: {
      title: 'Verification Error',
      description: 'The verification link is invalid or has expired.',
      suggestion: 'Please request a new verification link.'
    },
    Default: {
      title: 'Authentication Error',
      description: 'An unexpected error occurred during authentication.',
      suggestion: 'Please try again or contact support if the problem persists.'
    }
  }

  const errorInfo = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>

          {/* Error Description */}
          <p className="text-gray-600 mb-4">
            {errorInfo.description}
          </p>

          {/* Suggestion */}
          <p className="text-sm text-gray-500 mb-8">
            {errorInfo.suggestion}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link 
              href="/"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to Home
            </Link>
            
            <Link 
              href="/"
              className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Try Again
            </Link>
          </div>

          {/* Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">
                <strong>Debug Info:</strong><br />
                Error Code: {error || 'Unknown'}<br />
                URL: {window.location.href}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}