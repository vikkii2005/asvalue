'use client'

import {
  QrCode,
  MessageSquare,
  Zap,
  Share2,
  BarChart3,
  Clock,
  Star,
} from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: QrCode,
      title: 'Professional Sales Pages',
      description:
        'Create unlimited product pages with magic links and QR codes. Each product gets a professional sales page that works everywhere.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      borderColor: 'border-purple-200 dark:border-purple-500/20',
      results: 'Unlimited products',
    },
    {
      icon: MessageSquare,
      title: 'AI Sales Assistant',
      description:
        'Train AI to know your products inside and out. It handles customer questions, explains features, and guides buyers to purchase.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      borderColor: 'border-blue-200 dark:border-blue-500/20',
      results: 'Smart responses',
    },
    {
      icon: Share2,
      title: 'Share Everywhere',
      description:
        'Share your products on any platform you choose. WhatsApp, Instagram, Facebook - one link works everywhere you sell.',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      borderColor: 'border-green-200 dark:border-green-500/20',
      results: 'All platforms',
    },
    {
      icon: Zap,
      title: 'Launch Instantly',
      description:
        'From idea to selling in under 10 minutes. Upload, price, and go live. Professional sales pages without the complexity.',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-500/10',
      borderColor: 'border-yellow-200 dark:border-yellow-500/20',
      results: 'Quick launch',
    },
    {
      icon: BarChart3,
      title: 'Sales Analytics',
      description:
        'Deep insights into customer behavior, product performance, and sales patterns. Make data-driven decisions to grow your business.',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-500/10',
      borderColor: 'border-red-200 dark:border-red-500/20',
      results: 'Smart insights',
    },
    {
      icon: Clock,
      title: 'Always Available',
      description:
        'Our AI handles customer interactions 24/7 while you focus on growing your business. Never miss a potential sale again.',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      borderColor: 'border-indigo-200 dark:border-indigo-500/20',
      results: '24/7 active',
    },
  ]

  return (
    <section className='bg-white py-20 dark:bg-gray-900'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mx-auto max-w-4xl text-center'>
          <div className='mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-6 py-2 text-sm font-medium text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300'>
            <Star className='mr-2 h-4 w-4' />
            Complete Sales Platform
          </div>

          <h2 className='mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl'>
            Everything You Need
            <span className='block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400'>
              To Sell Online.
            </span>
          </h2>

          <p className='text-xl leading-relaxed text-gray-600 dark:text-gray-300'>
            Our platform gives you everything needed to sell products online
            with AI assistance.
            <span className='font-semibold text-gray-900 dark:text-white'>
              Professional, reliable, and effective.
            </span>
          </p>
        </div>

        {/* Feature Grid */}
        <div className='mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`group rounded-2xl border ${feature.borderColor} bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-800`}
              >
                <div className='mb-6 flex items-center justify-between'>
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${feature.bgColor} transition-transform group-hover:scale-110`}
                  >
                    <Icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <span className='rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'>
                    {feature.results}
                  </span>
                </div>

                <h3 className='mb-4 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
                  {feature.title}
                </h3>
                <p className='leading-relaxed text-gray-600 dark:text-gray-300'>
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* CTA SECTION */}
        <div className='mt-24 text-center'>
          <div className='mx-auto max-w-4xl rounded-2xl border border-gray-300 bg-white p-12 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
            <h3 className='mb-6 text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl'>
              Ready to Start Selling Professionally?
            </h3>

            <p className='mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-gray-600 dark:text-gray-300'>
              Join entrepreneurs using our platform to sell their products
              online.
              <span className='font-semibold text-gray-900 dark:text-white'>
                {' '}
                Professional sales pages, AI assistance, and complete analytics.
              </span>
              Everything you need to succeed.
            </p>

            {/* VALUE PROPOSITIONS */}
            <div className='mx-auto mb-8 grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700'>
                <div className='flex items-center justify-center space-x-2'>
                  <Zap className='h-5 w-5 text-blue-500' />
                  <span className='text-lg font-bold text-gray-900 dark:text-white'>
                    Professional
                  </span>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  High-quality pages
                </p>
              </div>
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700'>
                <div className='flex items-center justify-center space-x-2'>
                  <Clock className='h-5 w-5 text-green-500' />
                  <span className='text-lg font-bold text-gray-900 dark:text-white'>
                    Reliable
                  </span>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  24/7 availability
                </p>
              </div>
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700'>
                <div className='flex items-center justify-center space-x-2'>
                  <MessageSquare className='h-5 w-5 text-purple-500' />
                  <span className='text-lg font-bold text-gray-900 dark:text-white'>
                    Complete
                  </span>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  Full platform
                </p>
              </div>
            </div>

            {/* CTA BUTTON */}
            <div className='mb-6'>
              <button className='inline-flex h-16 min-w-[280px] items-center justify-center rounded-xl bg-blue-600 px-10 text-lg font-bold text-white shadow-lg transition-colors hover:bg-blue-700 hover:shadow-xl'>
                <Zap className='mr-3 h-6 w-6 flex-shrink-0' />
                <span className='whitespace-nowrap'>Start Selling Today</span>
              </button>
            </div>

            {/* TERMS */}
            <p className='text-sm leading-relaxed text-gray-500 dark:text-gray-400'>
              ✨ <span className='font-medium'>Professional platform</span> • ⚡{' '}
              <span className='font-medium'>Instant setup</span> • 🚀{' '}
              <span className='font-medium'>Start immediately</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
