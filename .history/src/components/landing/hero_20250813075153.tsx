'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { ArrowRight, Play, Sparkles, QrCode, MessageSquare, TrendingUp } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export function LandingHero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
      
      <div className="container relative px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border bg-background/50 px-4 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Revolutionary AI Sales Platform
          </div>

          {/* Main Headline */}
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Turn Your Products Into{' '}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
              AI Sales Machines
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-xl text-muted-foreground md:text-2xl">
            Create magic links in 5 minutes. Get instant QR codes. Let AI handle customer questions 24/7. 
            Start selling anywhere, anytime.
          </p>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
              300% conversion increase
            </div>
            <div className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
              24/7 AI customer service
            </div>
            <div className="flex items-center">
              <QrCode className="mr-2 h-4 w-4 text-purple-500" />
              Instant QR codes
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => signIn('google')}
              className="group inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            
            <button
              onClick={() => setIsVideoPlaying(true)}
              className="group inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background px-8 text-base font-semibold shadow-sm transition-all hover:bg-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </button>
          </div>

          {/* Social Proof */}
          <p className="mt-8 text-sm text-muted-foreground">
            Join 10,000+ sellers already using {APP_CONFIG.name}
          </p>
        </div>

        {/* Hero Visual */}
        <div className="mx-auto mt-16 max-w-6xl">
          <div className="relative rounded-2xl bg-gradient-to-tr from-primary/10 to-secondary/10 p-4 shadow-2xl">
            <div className="rounded-lg bg-background p-8 shadow-lg">
              {/* Mock Interface */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Product Card */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <div className="mb-4 h-32 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <h3 className="text-lg font-semibold">Premium Headphones</h3>
                  <p className="mt-1 text-2xl font-bold text-primary">$299</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Magic Code: ABCD123456</span>
                    <QrCode className="h-8 w-8 text-primary" />
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">AI Customer Chat</h3>
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-accent p-3 text-sm">
                      "What size should I order?"
                    </div>
                    <div className="rounded-lg bg-primary/10 p-3 text-sm">
                      "Check our size chart - these run true to size. Would you like me to help you find the perfect fit?"
                    </div>
                    <div className="rounded-lg bg-accent p-3 text-sm">
                      "How much is shipping?"
                    </div>
                    <div className="rounded-lg bg-primary/10 p-3 text-sm">
                      "Free shipping on orders over $50! Your order qualifies ✨"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsVideoPlaying(false)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="h-8 w-8" />
            </button>
            <div className="aspect-video rounded-lg bg-black">
              <div className="flex h-full items-center justify-center text-white">
                <p>Demo video would play here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}