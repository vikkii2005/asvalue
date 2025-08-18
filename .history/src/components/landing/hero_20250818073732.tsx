'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Play,
  QrCode,
  MessageSquare,
  TrendingUp,
  X,
  Zap,
  CheckCircle,
} from 'lucide-react'

export default function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const router = useRouter()

  // Updated handler to navigate to authentication
  const handleSignUp = () => {
    console.log('🚀 Redirecting to authentication...')
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    // Navigate to your authentication page
    router.push('/auth/signin')
  }

  return (
    <section className='relative overflow-hidden bg-white pb-16 pt-20 md:pb-20 md:pt-32 dark:bg-gray-900'>
      {/* Background decoration */}
      <div className='absolute inset-0 opacity-20 dark:opacity-5'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          {/* Badge */}
          <div className='mb-8 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-6 py-2 text-sm shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10'>
            <Zap className='mr-2 h-4 w-4 text-blue-600 dark:text-blue-400' />
            <span className='font-medium text-blue-800 dark:text-blue-300'>
              🚀 Instant Setup • No Credit Card Required
            </span>
          </div>

          {/* Headline */}
          <h1 className='mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl lg:text-7xl dark:text-white'>
            From Product to{' '}
            <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400'>
              Profit Machine
            </span>{' '}
            in Minutes
          </h1>

          {/* Subheadline */}
          <p className='mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600 md:text-2xl dark:text-gray-300'>
            Skip the complexity. Your AI sales assistant handles everything:
            customer questions, objections, and closing deals while you sleep.
          </p>

          {/* Stats */}
          <div className='mb-10 flex flex-wrap justify-center gap-6 text-sm'>
            <div className='flex items-center rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <TrendingUp className='mr-2 h-4 w-4 text-green-500' />
              <span className='font-medium text-gray-700 dark:text-gray-200'>
                3x More Sales
              </span>
            </div>
            <div className='flex items-center rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <MessageSquare className='mr-2 h-4 w-4 text-blue-500' />
              <span className='font-medium text-gray-700 dark:text-gray-200'>
                24/7 AI Support
              </span>
            </div>
            <div className='flex items-center rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <QrCode className='mr-2 h-4 w-4 text-purple-500' />
              <span className='font-medium text-gray-700 dark:text-gray-200'>
                Instant Setup
              </span>
            </div>
          </div>

          {/* CTA Buttons - MAIN BUTTON CONNECTED TO AUTH! */}
          <div className='mb-8 flex flex-col justify-center gap-4 sm:flex-row'>
            <button
              onClick={handleSignUp}
              className='group inline-flex h-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-10 text-xl font-bold text-white shadow-2xl transition-all hover:-translate-y-1 hover:from-blue-700 hover:to-purple-700 hover:shadow-3xl min-w-[300px]'
            >
              <Zap className='mr-3 h-6 w-6' />
              <span className='whitespace-nowrap'>Start Selling Today</span>
              <ArrowRight className='ml-3 h-6 w-6 transition-transform group-hover:translate-x-1' />
            </button>

            <button
              onClick={() => setIsVideoPlaying(true)}
              className='group inline-flex h-16 items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-8 text-lg font-semibold text-gray-700 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
            >
              <Play className='mr-3 h-5 w-5' />
              See How It Works
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className='mx-auto mt-16 max-w-6xl'>
          <div className='relative rounded-2xl border border-gray-200 bg-gray-100 p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800'>
            <div className='rounded-xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900'>
              <div className='grid gap-8 md:grid-cols-2'>
                {/* Product Card */}
                <div className='rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-600 dark:bg-gray-800'>
                  <div className='mb-4 flex h-32 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
                    <div className='flex h-16 w-16 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-700'>
                      <span className='text-2xl'>🎧</span>
                    </div>
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    Wireless Pro Headphones
                  </h3>
                  <div className='mt-3 flex items-center justify-between'>
                    <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>$199</p>
                    <span className='rounded-full bg-green-100 px-3 py-1 text-sm text-green-600 dark:bg-green-900/30 dark:text-green-400'>
                      In Stock
                    </span>
                  </div>
                  <div className='mt-4 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20'>
                    <div>
                      <span className='text-xs text-gray-500 dark:text-gray-400'>Magic Link</span>
                      <p className='font-mono text-sm font-medium text-gray-900 dark:text-white'>WPH2024</p>
                    </div>
                    <QrCode className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                  </div>
                </div>

                {/* AI Options Card */}
                <div className='rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-600 dark:bg-gray-800'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-600'>
                        <Zap className='h-4 w-4 text-white' />
                      </div>
                      <h3 className='font-semibold text-gray-900 dark:text-white'>AI Sales Options</h3>
                    </div>
                    <div className='flex items-center space-x-1'>
                      <div className='h-2 w-2 animate-pulse rounded-full bg-green-500' />
                      <span className='text-xs text-green-600 dark:text-green-400'>Active</span>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='mb-3 text-xs font-medium text-purple-600 dark:text-purple-400'>
                      Customer Question: &apos;Tell me about these headphones&apos;
                    </div>

                    <div className='rounded-lg border-l-4 border-blue-500 bg-white p-3 shadow-sm dark:bg-gray-900'>
                      <div className='flex items-start space-x-2'>
                        <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500' />
                        <div>
                          <p className='text-sm font-medium text-gray-900 dark:text-white'>Sound Quality Focus</p>
                          <p className='text-xs text-gray-600 dark:text-gray-400'>Hi-Res audio, 40mm drivers, studio-grade sound</p>
                        </div>
                      </div>
                    </div>

                    <div className='rounded-lg border-l-4 border-green-500 bg-white p-3 shadow-sm dark:bg-gray-900'>
                      <div className='flex items-start space-x-2'>
                        <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
                        <div>
                          <p className='text-sm font-medium text-gray-900 dark:text-white'>Comfort & Design</p>
                          <p className='text-xs text-gray-600 dark:text-gray-400'>Lightweight, memory foam, 40hr battery life</p>
                        </div>
                      </div>
                    </div>

                    <div className='rounded-lg border-l-4 border-purple-500 bg-white p-3 shadow-sm dark:bg-gray-900'>
                      <div className='flex items-start space-x-2'>
                        <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500' />
                        <div>
                          <p className='text-sm font-medium text-gray-900 dark:text-white'>Price & Value</p>
                          <p className='text-xs text-gray-600 dark:text-gray-400'>30-day trial, 2-year warranty, free shipping</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='mt-4 flex items-center justify-between rounded border border-purple-100 bg-purple-50 p-2 text-xs text-gray-500 dark:border-purple-800 dark:bg-purple-900/20 dark:text-gray-400'>
                    <span>🤖 AI analyzing customer intent...</span>
                    <span className='font-medium text-purple-600 dark:text-purple-400'>3 options ready</span>
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
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4'
          onClick={() => setIsVideoPlaying(false)}
        >
          <div className='relative w-full max-w-4xl'>
            <button
              onClick={() => setIsVideoPlaying(false)}
              className='absolute -top-12 right-0 text-white transition-colors hover:text-gray-300'
            >
              <X className='h-8 w-8' />
            </button>
            <div className='aspect-video overflow-hidden rounded-xl border border-gray-700 bg-gray-900'>
              <div className='flex h-full items-center justify-center text-white'>
                <div className='text-center'>
                  <Play className='mx-auto mb-4 h-16 w-16 text-blue-400' />
                  <p className='mb-2 text-xl font-semibold'>Demo Video Coming Soon</p>
                  <p className='text-gray-400'>See how AI transforms your sales in real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}