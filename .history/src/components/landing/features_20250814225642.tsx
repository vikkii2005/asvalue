'use client'

import { useAuthContext } from '@/components/auth/FirebaseAuthProvider'
import {
  QrCode,
  MessageSquare,
  Zap,
  Share2,
  BarChart3,
  Clock,
  Star,
  TrendingUp,
} from 'lucide-react'

export default function Features() {
  const { signInWithGoogle, loading } = useAuthContext()

  const features = [
    {
      icon: QrCode,
      title: 'Magic Links That Convert',
      description: 'Turn any product into a sales machine in 5 minutes. Share magic links anywhere and watch your sales explode with instant QR codes.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      borderColor: 'border-purple-200 dark:border-purple-500/20',
      results: '3x more clicks',
    },
    {
      icon: MessageSquare,
      title: 'AI That Never Stops Selling',
      description: 'Your AI assistant handles every customer question, overcomes objections, and closes deals while you sleep. No more lost sales.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      borderColor: 'border-blue-200 dark:border-blue-500/20',
      results: '24/7 sales power',
    },
    {
      icon: Share2,
      title: 'Sell Everywhere Instantly',
      description: 'WhatsApp, Instagram, TikTok, Facebook - drop your magic link anywhere and start making money immediately. One link, infinite possibilities.',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      borderColor: 'border-green-200 dark:border-green-500/20',
      results: 'Multi-platform domination',
    },
    {
      icon: Zap,
      title: 'From Zero to Selling in Minutes',
      description: 'Upload photo, set price, done. No complicated setup, no technical skills needed. Your profit machine is ready before your coffee gets cold.',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-500/10',
      borderColor: 'border-yellow-200 dark:border-yellow-500/20',
      results: '5-minute setup',
    },
    {
      icon: BarChart3,
      title: 'See Every Dollar You Make',
      description: 'Real-time dashboard shows exactly which products are printing money. Track every click, conversation, and sale as it happens.',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-500/10',
      borderColor: 'border-red-200 dark:border-red-500/20',
      results: 'Live profit tracking',
    },
    {
      icon: Clock,
      title: 'Money While You Sleep',
      description: 'Your AI works 24/7/365. Customers buy at 3AM, AI handles everything. Wake up to sales notifications and growing bank account.',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      borderColor: 'border-indigo-200 dark:border-indigo-500/20',
      results: 'Passive income',
    },
  ]

  return (
    <section className='bg-white dark:bg-gray-900 py-20'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mx-auto max-w-4xl text-center'>
          <div className='mb-6 inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-500/10 px-6 py-2 text-sm font-medium text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20'>
            <Star className='mr-2 h-4 w-4' />
            The Complete Sales Automation Suite
          </div>
          
          <h2 className='mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl'>
            Stop Working Hard.
            <span className='block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent'>
              Start Earning Smart.
            </span>
          </h2>
          
          <p className='text-xl text-gray-600 dark:text-gray-300 leading-relaxed'>
            Why struggle with complicated sales funnels when AI can do everything for you? 
            <span className='font-semibold text-gray-900 dark:text-white'> Turn any product into a profit machine that works 24/7.</span>
          </p>
        </div>

        {/* Feature Grid - Removed "Learn More" */}
        <div className='mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`group rounded-2xl border ${feature.borderColor} bg-white dark:bg-gray-800 p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
              >
                <div className='mb-6 flex items-center justify-between'>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${feature.bgColor} transition-transform group-hover:scale-110`}>
                    <Icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <span className='rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-200 border border-gray-200 dark:border-gray-600'>
                    {feature.results}
                  </span>
                </div>

                <h3 className='mb-4 text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                  {feature.title}
                </h3>
                <p className='leading-relaxed text-gray-600 dark:text-gray-300'>
                  {feature.description}
                </p>

                {/* ✅ REMOVED "Learn More" Section Completely */}
              </div>
            )
          })}
        </div>

        {/* ✅ SIMPLE PROFESSIONAL CTA - NO GRADIENTS */}
        <div className='mt-24 text-center'>
          <div className='mx-auto max-w-4xl rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 shadow-lg'>
            
            <h3 className='mb-6 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl leading-tight'>
              Ready to Make Money While You Sleep?
            </h3>
            
            <p className='mb-8 text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto'>
              Join thousands of smart sellers who are already making 
              <span className='font-bold text-green-600 dark:text-green-400'> 3x more sales </span> 
              with AI automation. Free to start, no commitments. 
              <span className='font-bold text-blue-600 dark:text-blue-400'> Setup takes 5 minutes.</span>
            </p>

            {/* Social Proof Stats */}
            <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 max-w-2xl mx-auto'>
              <div className='rounded-lg bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600'>
                <div className='flex items-center justify-center space-x-2'>
                  <TrendingUp className='h-5 w-5 text-green-500' />
                  <span className='text-2xl font-bold text-gray-900 dark:text-white'>300%</span>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300'>Average Sales Increase</p>
              </div>
              <div className='rounded-lg bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600'>
                <div className='flex items-center justify-center space-x-2'>
                  <Clock className='h-5 w-5 text-blue-500' />
                  <span className='text-2xl font-bold text-gray-900 dark:text-white'>5</span>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300'>Minutes to Setup</p>
              </div>
              <div className='rounded-lg bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600'>
                <div className='flex items-center justify-center space-x-2'>
                  <MessageSquare className='h-5 w-5 text-purple-500' />
                  <span className='text-2xl font-bold text-gray-900 dark:text-white'>24/7</span>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300'>AI Sales Assistant</p>
              </div>
            </div>

            {/* ✅ FIXED BUTTON - Better Text Spacing */}
            <div className='mb-6'>
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className='inline-flex h-16 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-10 text-lg font-bold text-white shadow-lg transition-colors hover:shadow-xl disabled:opacity-50 min-w-[280px]'
              >
                {loading ? (
                  <>
                    <div className='mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white'></div>
                    <span className='whitespace-nowrap'>Getting Your Sales Machine Ready...</span>
                  </>
                ) : (
                  <>
                    <Zap className='mr-3 h-6 w-6 flex-shrink-0' />
                    <span className='whitespace-nowrap'>Start Earning Today</span>
                  </>
                )}
              </button>
            </div>

            {/* Risk Reversal */}
            <p className='text-sm text-gray-500 dark:text-gray-400 leading-relaxed'>
              🔒 <span className='font-medium'>100% Free to Start</span> • 
              ⚡ <span className='font-medium'>Instant Access</span> • 
              🚀 <span className='font-medium'>No Credit Card Required</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}