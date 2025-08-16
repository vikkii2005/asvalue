'use client'

import { signIn } from 'next-auth/react'
import { LandingHero } from '@/components/landing/hero'
import { LandingFeatures } from '@/components/landing/features'
import { LandingHowItWorks } from '@/components/landing/how-it-works'
import { LandingHeader } from '@/components/landing/header'
import { LandingFooter } from '@/components/landing/footer'

export default function HomePage() {
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
            <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to Transform Your Sales?
            </h2>
            <p className="mt-4 text-xl text-primary-foreground/80">
              Join our free beta and be among the first 20 sellers to shape the future of AI sales.
            </p>
            <div className="mt-8">
              <button
                onClick={() => signIn('google')}
                className="inline-flex h-12 items-center justify-center rounded-lg bg-background px-8 text-base font-semibold text-foreground shadow-lg transition-all hover:bg-background/90 hover:shadow-xl"
              >
                Start Free Beta Now
              </button>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/60">
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