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
} from 'lucide-react'

export default function Features() {
  const { signInWithGoogle, loading } = useAuthContext()

  const features = [
    {
      icon: QrCode,
      title: 'Your Personal Sales Hub',
      description: 'Create unlimited product pages with magic links and QR codes. Every product gets its own professional sales page that works everywhere.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      borderColor: 'border-purple-200 dark:border-purple-500/20',
      results: 'Unlimited products',
    },
    {
      icon: MessageSquare,
      title: 'Your AI Sales Representative',
      description: 'Train your AI to know your products inside and out. It handles customer questions, explains features, and guides buyers to purchase.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      borderColor: 'border-blue-200 dark:border-blue-500/20',
      results: 'Your personal AI',
    },
    {
      icon: Share2,
      title: 'Sell On Your Terms',
      description: 'Your platform, your rules. Share your products on any channel you choose. No marketplace fees, no third-party dependencies.',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      borderColor: 'border-green-200 dark:border-green-500/20',
      results: 'Complete freedom',
    },
    {
      icon: Zap,
      title: 'Launch in Minutes',
      description: 'From idea to selling in under 10 minutes. Upload, price, and go live. Your own professional sales platform without the complexity.',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-500/10',
      borderColor: 'border-yellow-200 dark:border-yellow-500/20',
      results: 'Instant launch',
    },
    {
      icon: BarChart3,
      title: 'Your Business Intelligence',
      description: 'Deep insights into customer behavior, product performance, and sales patterns. Make data-driven decisions to grow your business.',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-500/10',
      borderColor: 'border-red-200 dark:border-red-500/20',
      results: 'Smart insights',
    },
    {
      icon: Clock,
      title: 'Work When You Want',
      description: 'Your AI handles customer interactions 24/7 while you focus on what matters. Build a business that works around your life.',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      borderColor: 'border-indigo-200 dark:border-indigo-500/20',
      results: 'Your schedule',
    },
  ]

  return (
    <section className='bg-white dark:bg-gray-900 py-20'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mx-auto max-w-4xl text-center'>
          <div className='mb-6 inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-500/10 px-6 py-2 text-sm font-medium text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20'>
            <Star className='mr-2 h-4 w-4' />
            Your Complete Sales Platform
          </div>
          
          <h2 className='mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl'>
            Build Your Own
            <span className='block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent'>
              Sales Empire.
            </span>
          </h2>
          
          <p className='text-xl text-gray-600 dark:text-gray-300 leading-relaxed'>
            Your platform, your products, your success. 
            <span className='font-semibold text-gray-900 dark:text-white'>No dependencies, no limitations, just pure selling power.</span>
          </p>
        </div>

        {/* Feature Grid */}
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
              </div>
            )
          })}
        </div>

        {/* EMPOWERING CTA SECTION */}
        <div className='mt-24 text-center'>
          <div className='mx-auto max-w-4xl rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-12 shadow-lg'>
            
            <h3 className='mb-6 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl leading-tight'>
              Ready to Own Your Sales Success?
            </h3>
            
            <p className='mb-8 text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto'>
              Join entrepreneurs who've taken control of their sales process. 
              <span className='font-semibold text-gray-900 dark:text-white'> Your platform, your rules, your profits.</span> 
              No middlemen, no dependencies.
            </p>

            {/* VALUE PROPOSITIONS - EMPOWERING */}
            <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 max-w-2xl mx-auto'>
              <div className='rounded-lg bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600'>
                <div className='flex items-center justify-center space-x-2'>
                  <Zap className='h-5 w-5 text-blue-500' />
                  <span className='text-lg font-bold text-gray-900 dark:text-white'>Independent</span>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300'>Own your platform</p>
              </div>
              <div className='rounded-lg bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600'>
                <div className='flex items-center justify-center space-x-2'>
                  <Clock className='h-5 w-5 text-green-500' />
                  <span className='text-lg font-bold text-gray-900 dark:text-white'>Unlimited</span>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300'>No restrictions</p>
              </div>
              <div className='rounded-lg bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600'>
                <div className='flex items-center justify-center space-x-2'>
                  <MessageSquare className='h-5 w-5 text-purple-500' />
                  <span className='text-lg font-bold text-gray-900 dark:text-white'>Powerful</span>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300'>AI-enhanced</p>
              </div>
            </div>

            {/* EMPOWERING CTA BUTTON */}
            <div className='mb-6'>
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className='inline-flex h-16 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-10 text-lg font-bold text-white shadow-lg transition-colors hover:shadow-xl disabled:opacity-50 min-w-[280px]'
              >
                {loading ? (
                  <>
                    <div className='mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white'></div>
                    <span className='whitespace-nowrap'>Building your platform...</span>
                  </>
                ) : (
                  <>
                    <Zap className='mr-3 h-6 w-6 flex-shrink-0' />
                    <span className='whitespace-nowrap'>Claim Your Platform</span>
                  </>
                )}
              </button>
            </div>

            {/* EMPOWERING TERMS */}
            <p className='text-sm text-gray-500 dark:text-gray-400 leading-relaxed'>
              🏆 <span className='font-medium'>Own your success</span> • 
              ⚡ <span className='font-medium'>No dependencies</span> • 
              🚀 <span className='font-medium'>Start immediately</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}