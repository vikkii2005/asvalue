'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log errors only in development to avoid eslint no-console warning
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Application error:', error)
    }
  }, [error])

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='mx-auto max-w-md text-center'>
        <h2 className='text-foreground text-2xl font-bold'>
          Something went wrong!
        </h2>
        <p className='text-muted-foreground mt-2'>
          We&apos;re sorry, but something unexpected happened.
        </p>
        <button
          onClick={reset}
          className='bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex h-9 items-center justify-center rounded-md px-8 text-sm font-semibold shadow transition-colors'
        >
          Try again
        </button>
      </div>
    </div>
  )
}
