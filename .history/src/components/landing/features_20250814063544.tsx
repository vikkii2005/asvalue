'use client'

import { signIn } from 'next-auth/react'
import {
  QrCode,
  MessageSquare,
  Zap,
  Share2,
  BarChart3,
  Clock,
} from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: QrCode,
      title: 'Magic Links & QR Codes',
      description:
        'Create shareable product links in 5 minutes. Get instant QR codes for offline-to-online bridge selling.',
      color: 'text-purple-500',
    },
    {
      icon: MessageSquare,
      title: '24/7 AI Customer Service',
      description:
        'AI answers customer questions instantly. Handles size, shipping, returns, and product details automatically.',
      color: 'text-blue-500',
    },
    {
      icon: Share2,
      title: 'Share Anywhere',
      description:
        'WhatsApp, Instagram, Facebook, SMS - share your magic links on any platform and start selling immediately.',
      color: 'text-green-500',
    },
    {
      icon: Zap,
      title: 'Instant Setup',
      description:
        'Add product photo, set price, create 3 AI questions. Your AI sales machine is ready in under 5 minutes.',
      color: 'text-yellow-500',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description:
        'Track views, clicks, conversations, and sales. See exactly how your products perform across platforms.',
      color: 'text-red-500',
    },
    {
      icon: Clock,
      title: 'Always On Sales',
      description:
        "Your AI never sleeps. Customers get instant responses 24/7, even when you're not available.",
      color: 'text-indigo-500',
    },
  ]

  return (
    <section id="features" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Sell
          </h2>
          <p className="text-xl text-gray-600">
            Transform any product into an AI-powered sales machine with these powerful features
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Beta CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to Join the Beta?
            </h3>
            <p className="text-gray-600 mb-6">
              Be among the first 20 sellers to experience the future of AI-powered sales
            </p>
            <button
              onClick={() => signIn('google', { callbackUrl: '/profile' })}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Join Free Beta Now
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}