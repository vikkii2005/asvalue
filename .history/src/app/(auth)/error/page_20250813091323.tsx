'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowRight } from 'lucide-react'

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired.',
  Default: 'An error occurred during authentication.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages
  const message = errorMessages[error] || errorMessages.Default

  return (
    <div className="space-y-8">
      {/* Error Icon */}
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
      </div>

      {/* Error Message */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Authentication Error
        </h1>
        <p className="text-muted-foreground mb-6">
          {message}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Link
          href="/auth/signin"
          className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-medium shadow hover:bg-primary/90 transition-colors"
        >
          <span>Try Again</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        
        <Link
          href="/"
          className="w-full flex items-center justify-center space-x-2 border border-input bg-background rounded-lg px-6 py-3 text-sm font-medium shadow-sm hover:bg-accent transition-colors"
        >
          <span>Go Home</span>
        </Link>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          If this problem persists, please contact support at{' '}
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@asvalue.com'}`}
            className="text-primary hover:underline"
          >
            support@asvalue.com
          </a>
        </p>
      </div>
    </div>
  )
}