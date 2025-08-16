import { Metadata } from 'next'
import { APP_CONFIG } from '@/lib/constants'
import { LandingHero } from '@/components/landing/hero'
import { LandingFeatures } from '@/components/landing/features'
import { LandingHowItWorks } from '@/components/landing/how-it-works'
import { LandingDemo } from '@/components/landing/demo'
import { LandingPricing } from '@/components/landing/pricing'
import { LandingTestimonials } from '@/components/landing/testimonials'
import { LandingCTA } from '@/components/landing/cta'
import { LandingHeader } from '@/components/landing/header'
import { LandingFooter } from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'AI-Powered Sales Revolution | ASVALUE',
  description: 'Transform your products into AI-powered sales machines. Create magic links, get instant QR codes, and let AI handle customer questions 24/7.',
  openGraph: {
    title: 'ASVALUE - AI Sales Revolution',
    description: 'Turn any product into an AI-powered sales machine with magic links, QR codes, and 24/7 AI customer service.',
    images: ['/og-landing.jpg'],
  },
}

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
        
        {/* Live Demo Section */}
        <LandingDemo />
        
        {/* Pricing Section */}
        <LandingPricing />
        
        {/* Testimonials Section */}
        <LandingTestimonials />
        
        {/* Final CTA Section */}
        <LandingCTA />
      </div>
      
      {/* Footer */}
      <LandingFooter />
    </div>
  )
}