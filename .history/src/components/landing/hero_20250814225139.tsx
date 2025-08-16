'use client'
import { useState } from 'react'
import { useAuthContext } from '@/components/auth/FirebaseAuthProvider'
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
  const { signInWithGoogle, loading } = useAuthContext()

  return (
    <section className='relative overflow-hidden bg-white dark:bg-gray-900 pb-16 pt-20 md:pb-20 md:pt-32'>
      {/* Minimal background decoration */}
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
          {/* Simple Badge - No Gradient */}
          <div className='mb-8 inline-flex items-center rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-6 py-2 text-sm shadow-sm'>
            <Zap className='mr-2 h-4 w-4 text-blue-600 dark:text-blue-400' />
            <span className='font-medium text-blue-800 dark:text-blue-300'>
              🚀 Launch in Under 5 Minutes • No Credit Card
            </span>
          </div>

          {/* Headline with Text Gradient Only */}
          <h1 className='mb-6 text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-6xl lg:text-7xl'>
            From Product to{' '}
            <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent'>
              Profit Machine
            </span>
            {' '}in Minutes
          </h1>

          {/* Subheadline */}
          <p className='mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300 md:text-2xl'>
            Skip the complexity. Your AI sales assistant handles everything: 
            customer questions, objections, and closing deals while you sleep.
          </p>

          {/* Stats - Clean Design */}
          <div className='mb-10 flex flex-wrap justify-center gap-6 text-sm'>
            <div className='flex items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-sm border border-gray-200 dark:border-gray-700'>
              <TrendingUp className='mr-2 h-4 w-4 text-green-500' />
              <span className='font-medium text-gray-700 dark:text-gray-200'>3x More Sales</span>
            </div>
            <div className='flex items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-sm border border-gray-200 dark:border-gray-700'>
              <MessageSquare className='mr-2 h-4 w-4 text-blue-500' />
              <span className='font-medium text-gray-700 dark:text-gray-200'>24/7 AI Support</span>
            </div>
            <div className='flex items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-sm border border-gray-200 dark:border-gray-700'>
              <QrCode className='mr-2 h-4 w-4 text-purple-500' />
              <span className='font-medium text-gray-700 dark:text-gray-200'>Instant Setup</span>
            </div>
          </div>

          {/* CTA Buttons - Gradient Only on Main CTA */}
          <div className='mb-8 flex flex-col justify-center gap-4 sm:flex-row'>
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className='group inline-flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 text-lg font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-50'
            >
              {loading ? (
                <>
                  <div className='mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white'></div>
                  Getting Ready...
                </>
              ) : (
                <>
                  <Zap className='mr-3 h-5 w-5' />
                  Start Selling Today
                  <ArrowRight className='ml-3 h-5 w-5 transition-transform group-hover:translate-x-1' />
                </>
              )}
            </button>

            <button
              onClick={() => setIsVideoPlaying(true)}
              className='group inline-flex h-14 items-center justify-center rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-8 text-lg font-semibold text-gray-700 dark:text-gray-200 shadow-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl'
            >
              <Play className='mr-3 h-5 w-5' />
              See How It Works
            </button>
          </div>
        </div>

        {/* Hero Visual - Clean Solid Backgrounds */}
        <div className='mx-auto mt-16 max-w-6xl'>
          <div className='relative rounded-2xl bg-gray-100 dark:bg-gray-800 p-6 shadow-2xl border border-gray-200 dark:border-gray-700'>
            <div className='rounded-xl bg-white dark:bg-gray-900 p-8 shadow-lg border border-gray-100 dark:border-gray-800'>
              <div className='grid gap-8 md:grid-cols-2'>
                {/* Product Card - Solid Colors */}
                <div className='rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-6 shadow-sm'>
                  <div className='mb-4 h-32 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                    <div className='h-16 w-16 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm'>
                      <span className='text-2xl'>🎧</span>
                    </div>
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    Wireless Pro Headphones
                  </h3>
                  <div className='flex items-center justify-between mt-3'>
                    <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>$199</p>
                    <span className='text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full'>
                      In Stock
                    </span>
                  </div>
                  <div className='mt-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800'>
                    <div>
                      <span className='text-xs text-gray-500 dark:text-gray-400'>Magic Link</span>
                      <p className='font-mono text-sm font-medium text-gray-900 dark:text-white'>WPH2024</p>
                    </div>
                    <QrCode className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                  </div>
                </div>

                {/* AI Options Card - Solid Colors */}
                <div className='rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-6 shadow-sm'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center'>
                        <Zap className='h-4 w-4 text-white' />
                      </div>
                      <h3 className='font-semibold text-gray-900 dark:text-white'>
                        AI Sales Options
                      </h3>
                    </div>
                    <div className='flex items-center space-x-1'>
                      <div className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
                      <span className='text-xs text-green-600 dark:text-green-400'>Active</span>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='text-xs text-purple-600 dark:text-purple-400 font-medium mb-3'>
                      Customer Question: &ldquo;Tell me about these headphones&rdquo;
                    </div>
                    
                    <div className='rounded-lg bg-white dark:bg-gray-900 p-3 border-l-4 border-blue-500 shadow-sm'>
                      <div className='flex items-start space-x-2'>
                        <CheckCircle className='h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='text-sm font-medium text-gray-900 dark:text-white'>Sound Quality Focus</p>
                          <p className='text-xs text-gray-600 dark:text-gray-400'>Hi-Res audio, 40mm drivers, studio-grade sound</p>
                        </div>
                      </div>
                    </div>

                    <div className='rounded-lg bg-white dark:bg-gray-900 p-3 border-l-4 border-green-500 shadow-sm'>
                      <div className='flex items-start space-x-2'>
                        <CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='text-sm font-medium text-gray-900 dark:text-white'>Comfort & Design</p>
                          <p className='text-xs text-gray-600 dark:text-gray-400'>Lightweight, memory foam, 40hr battery life</p>
                        </div>
                      </div>
                    </div>

                    <div className='rounded-lg bg-white dark:bg-gray-900 p-3 border-l-4 border-purple-500 shadow-sm'>
                      <div className='flex items-start space-x-2'>
                        <CheckCircle className='h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='text-sm font-medium text-gray-900 dark:text-white'>Price & Value</p>
                          <p className='text-xs text-gray-600 dark:text-gray-400'>30-day trial, 2-year warranty, free shipping</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className='mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded border border-purple-100 dark:border-purple-800'>
                    <span>🤖 AI analyzing customer intent...</span>
                    <span className='text-purple-600 dark:text-purple-400 font-medium'>3 options ready</span>
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
              className='absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors'
            >
              <X className='h-8 w-8' />
            </button>
            <div className='aspect-video rounded-xl bg-gray-900 border border-gray-700 overflow-hidden'>
              <div className='flex h-full items-center justify-center text-white'>
                <div className='text-center'>
                  <Play className='h-16 w-16 mx-auto mb-4 text-blue-400' />
                  <p className='text-xl font-semibold mb-2'>Demo Video Coming Soon</p>
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