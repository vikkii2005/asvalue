'use client'

import { Upload, Bot, Share2 } from 'lucide-react'

export function LandingHowItWorks() {
  const steps = [
    {
      step: 1,
      icon: Upload,
      title: 'Add Your Product',
      description: 'Upload a photo, set your price, and create 3 simple AI questions your customers might ask.',
      time: '2 minutes',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      step: 2,
      icon: Bot,
      title: 'AI Gets Trained',
      description: 'Our AI learns about your product and prepares to answer customer questions 24/7.',
      time: '30 seconds',
      color: 'from-purple-500 to-pink-500'
    },
    {
      step: 3,
      icon: Share2,
      title: 'Share & Sell',
      description: 'Get your magic link and QR code. Share on WhatsApp, Instagram, or anywhere and start selling!',
      time: 'Instant',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-secondary/5">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From product to sales machine in under 5 minutes
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-16 left-1/2 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent lg:block" />
                  )}
                  
                  <div className="relative rounded-2xl border bg-card p-8 shadow-sm">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-8">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${step.color} text-sm font-bold text-white shadow-lg`}>
                        {step.step}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-6">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-muted-foreground">
                      {step.description}
                    </p>

                    {/* Time Badge */}
                    <div className="mt-6">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        ⚡ {step.time}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Example Flow */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-purple/5 to-secondary/10 p-8">
            <h3 className="text-center text-xl font-semibold text-foreground mb-8">
              See It In Action
            </h3>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 h-24 w-24 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <p className="font-medium">Upload Product</p>
                <p className="text-sm text-muted-foreground">iPhone 15 Pro - $999</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-4 h-24 w-24 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <p className="font-medium">AI Ready</p>
                <p className="text-sm text-muted-foreground">Answers: Size, shipping, warranty</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-4 h-24 w-24 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <p className="font-medium">Start Selling</p>
                <p className="text-sm text-muted-foreground">Magic link: asvalue.com/ABC123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}