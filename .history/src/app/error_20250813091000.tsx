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
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-bold text-foreground">Something went wrong!</h2>
        <p className="mt-2 text-muted-foreground">
          We&apos;re sorry, but something unexpected happened.
        </p>
        <button
          onClick={reset}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}