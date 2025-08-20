'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'unknown_error'
  const details = searchParams.get('details') || ''

  const errorMessages: Record<string, string> = {
    access_denied: 'You cancelled the sign-in process.',
    invalid_request: 'There was an issue with the sign-in request.',
    invalid_state: 'Security validation failed. Please try again.',
    token_exchange_failed: 'Failed to complete authentication with Google.',
    authentication_failed: 'Authentication process failed.',
    missing_parameters: 'Required authentication parameters are missing.',
    unknown_error: 'An unexpected error occurred during sign-in.',
  }

  const message = errorMessages[error] || errorMessages.unknown_error

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center max-w-md mx-auto px-4'>
        <div className='mb-6 text-6xl'>❌</div>
        
        <h1 className='text-2xl font-bold text-red-600 mb-4'>
          Authentication Failed
        </h1>
        
        <p className='text-gray-700 mb-4'>{message}</p>
        
        {details && (
          <div className='mb-6 p-3 bg-red-50 rounded-lg border border-red-200'>
            <p className='text-sm text-red-700'>
              <strong>Details:</strong> {details}
            </p>
          </div>
        )}
        
        <div className='space-y-3'>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className='w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700'
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className='w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300'
          >
            Go Home
          </button>
        </div>
        
        <div className='mt-6 text-sm text-gray-500'>
          If this problem persists, please contact support.
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className='flex min-h-screen items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}