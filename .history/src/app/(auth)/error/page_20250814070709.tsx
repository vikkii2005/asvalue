'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages = {
    AccessDenied: {
      title: 'Access Denied',
      description: 'We couldn\'t complete your sign-in. This usually happens when there\'s an issue creating your account in our system.',
      suggestion: 'This is often a temporary database issue. Please try signing in again.',
      canRetry: true
    },
    Configuration: {
      title: 'Configuration Error',
      description: 'There\'s a configuration issue with our authentication system.',
      suggestion: 'Please try again in a few minutes.',
      canRetry: true
    },
    Default: {
      title: 'Authentication Error',
      description: 'An unexpected error occurred during authentication.',
      suggestion: 'Please try again or contact support if the problem persists.',
      canRetry: true
    }
  }

  const errorInfo = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default

  const handleRetry = () => {
    // Clear any cached auth state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nextauth.message')
      sessionStorage.clear()
    }
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>

          <p className="text-gray-600 mb-4 leading-relaxed">
            {errorInfo.description}
          </p>

          <p className="text-sm text-gray-500 mb-8">
            {errorInfo.suggestion}
          </p>

          <div className="space-y-3">
            {errorInfo.canRetry && (
              <button
                onClick={handleRetry}
                className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            )}
            
            <Link 
              href="/"
              className="flex items-center justify-center w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-xs text-gray-500">
                <strong>Debug Info:</strong><br />
                Error Code: {error || 'Unknown'}<br />
                Timestamp: {new Date().toISOString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}