'use client'

import { Upload, Bot, Share2 } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      step: 1,
      icon: Upload,
      title: 'Add Your Product',
      description:
        'Upload a photo, set your price, and create 3 simple AI questions your customers might ask.',
      time: '2 minutes',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      step: 2,
      icon: Bot,
      title: 'AI Gets Trained',
      description:
        'Our AI learns about your product and prepares to answer customer questions 24/7.',
      time: '30 seconds',
      color: 'from-purple-500 to-pink-500',
    },
    {
      step: 3,
      icon: Share2,
      title: 'Share & Sell',
      description:
        'Get your magic link and QR code. Share on WhatsApp, Instagram, or anywhere and start selling!',
      time: 'Instant',
      color: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            From product to sales machine in under 5 minutes
          </p>
        </div>

        <div className="mt-16 max-w-6xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-16 hidden h-0.5 w-full bg-gradient-to-r from-blue-300 to-transparent lg:block" />
                  )}

                  <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-8">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${step.color} text-sm font-bold text-white shadow-lg`}
                      >
                        {step.step}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="bg-blue-50 mb-6 flex h-16 w-16 items-center justify-center rounded-xl">
                      <Icon className="text-blue-600 h-8 w-8" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Time Badge */}
                    <div>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
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
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-8">
              See It In Action
            </h3>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                  <span className="text-2xl">📱</span>
                </div>
                <p className="font-medium text-gray-900">Upload Product</p>
                <p className="text-sm text-gray-600">
                  iPhone 15 Pro - $999
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-200">
                  <span className="text-2xl">🤖</span>
                </div>
                <p className="font-medium text-gray-900">AI Ready</p>
                <p className="text-sm text-gray-600">
                  Answers: Size, shipping, warranty
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-green-200">
                  <span className="text-2xl">🚀</span>
                </div>
                <p className="font-medium text-gray-900">Start Selling</p>
                <p className="text-sm text-gray-600">
                  Magic link: asvalue.com/ABC123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}