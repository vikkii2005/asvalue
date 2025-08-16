'use client'

import { QrCode, MessageSquare, Zap, Share2, BarChart3, Clock } from 'lucide-react'

export function LandingFeatures() {
  const features = [
    {
      icon: QrCode,
      title: 'Magic Links & QR Codes',
      description: 'Create shareable product links in 5 minutes. Get instant QR codes for offline-to-online bridge selling.',
      color: 'text-purple-500'
    },
    {
      icon: MessageSquare,
      title: '24/7 AI Customer Service',
      description: 'AI answers customer questions instantly. Handles size, shipping, returns, and product details automatically.',
      color: 'text-blue-500'
    },
    {
      icon: Share2,
      title: 'Share Anywhere',
      description: 'WhatsApp, Instagram, Facebook, SMS - share your magic links on any platform and start selling immediately.',
      color: 'text-green-500'
    },
    {
      icon: Zap,
      title: 'Instant Setup',
      description: 'Add product photo, set price, create 3 AI questions. Your AI sales machine is ready in under 5 minutes.',
      color: 'text-yellow-500'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track views, clicks, conversations, and sales. See exactly how your products perform across platforms.',
      color: 'text-red-500'
    },
    {
      icon: Clock,
      title: 'Always On Sales',
      description: 'Your AI never sleeps. Customers get instant responses 24/7, even when you\'re not available.',
      color: 'text-indigo-500'
    }
  ]

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Sell
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Transform any product into an AI-powered sales machine with these powerful features
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="relative rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:shadow-primary/5"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Beta CTA */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <div className="rounded-2xl bg-primary/5 p-8 border">
            <h3 className="text-xl font-semibold text-foreground">
              Ready to Join the Beta?
            </h3>
            <p className="mt-2 text-muted-foreground">
              Be among the first 20 sellers to experience the future of AI-powered sales
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  const { signIn } = require('next-auth/react')
                  signIn('google')
                }}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90"
              >
                Join Free Beta Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}