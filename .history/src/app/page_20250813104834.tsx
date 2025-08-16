'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { LandingHero } from '@/components/landing/hero'
import { LandingFeatures } from '@/components/landing/features'
import { LandingHowItWorks } from '@/components/landing/how-it-works'
import { LandingHeader } from '@/components/landing/header'
import { LandingFooter } from '@/components/landing/footer'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (session) {
      router.push('/dashboard') // Redirect to dashboard immediately
    }
  }, [session, status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Only show landing page if user is NOT authenticated
  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    ) // Will redirect via useEffect
  }

  // Landing page content - only shown to unauthenticated users
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <LandingHeader />

      {/* Main Content */}
      <div className="flex-1">
        {/* Hero Section */}
        <LandingHero />

        {/* Features Section */}
        <LandingFeatures />

        {/* How It Works Section */}
        <LandingHowItWorks />

        {/* Simple CTA Section */}
        <section className="bg-primary py-20">
          <div className="container px-4 text-center">
            <h2 className="text-primary-foreground text-3xl font-bold md:text-4xl">
              Ready to Transform Your Sales?
            </h2>
            <p className="text-primary-foreground/80 mt-4 text-xl">
              Join our free beta and be among the first 20 sellers to shape the
              future of AI sales.
            </p>
            <div className="mt-8">
              <button
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="bg-background text-foreground hover:bg-background/90 inline-flex h-12 items-center justify-center rounded-lg px-8 text-base font-semibold shadow-lg transition-all hover:shadow-xl"
              >
                Start Free Beta Now
              </button>
            </div>
            <p className="text-primary-foreground/60 mt-4 text-sm">
              No credit card required • Free during beta
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}