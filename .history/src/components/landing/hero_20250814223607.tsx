'use client'
import { useState } from 'react'
import { useAuthContext } from '@/components/auth/FirebaseAuthProvider'
import {
  ArrowRight,
  Play,
  Sparkles,
  QrCode,
  MessageSquare,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export default function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const { signInWithGoogle, loading } = useAuthContext()

  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 pb-16 pt-20 md:pb-20 md:pt-32'>
      {/* Background decoration */}
      <div className='absolute inset-0 opacity-40 dark:opacity-20'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      <div className='absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-400/10 dark:bg-blue-400/5 blur-3xl' />
      <div className='absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-400/10 dark:bg-indigo-400/5 blur-3xl' />

      <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          {/* Engaging Badge */}
          <div className='mb-8 inline-flex items-center rounded-full border border-blue-200 dark:border-blue-400/30 bg-blue-50/50 dark:bg-blue-900/30 px-6 py-2 text-sm shadow-sm backdrop-blur-sm'>
            <Zap className='mr-2 h-4 w-4 text-blue-600 dark:text-blue-400' />
            <span className='font-medium text-blue-800 dark:text-blue-300'>
              🚀 Launch in Under 5 Minutes • No Credit Card
            </span>
          </div>

          {/* More Engaging Headline */}
          <h1 className='mb-6 text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-6xl lg:text-7xl'>
            From Product to{' '}
            <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent'>
              Profit Machine
            </span>
            {' '}in Minutes
          </h1>

          {/* Faster, More Urgent Subheadline */}
          <p className='mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300 md:text-2xl'>
            Skip the complexity. Your AI sales assistant handles everything: 
            customer questions, objections, and closing deals while you sleep.
          </p>

          {/* Enhanced Stats */}
          <div className='mb-10 flex flex-wrap justify-center gap-8 text-sm text-gray-600 dark:text-gray-400'>
            <div className='flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm'>
              <TrendingUp className='mr-2 h-4 w-4 text-green-500' />
              <span className='font-medium'>3x More Sales</span>
            </div>
            <div className='flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm'>
              <MessageSquare className='mr-2 h-4 w-4 text-blue-500' />
              <span className='font-medium'>24/7 AI Support</span>
            </div>
            <div className='flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm'>
              <QrCode className='mr-2 h-4 w-4 text-purple-500' />
              <span className='font-medium'>Instant Setup</span>
            </div>
          </div>

          {/* More Engaging CTA Buttons */}
          <div className='mb-8 flex flex-col justify-center gap-4 sm:flex-row'>
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className='group inline-flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 text-lg font-bold text-white shadow-2xl transition-all hover:-translate-y-1 hover:shadow-3xl disabled:opacity-50 dark:shadow-blue-500/25'
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
              className='group inline-flex h-14 items-center justify-center rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-8 text-lg font-semibold text-gray-700 dark:text-gray-300 shadow-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl'
            >
              <Play className='mr-3 h-5 w-5' />
              See How It Works
            </button>
          </div>

          {/* Removed the "first 20 beta users" text completely */}
        </div>

        {/* Enhanced Hero Visual with Dark Mode */}
        <div className='mx-auto mt-16 max-w-6xl'>
          <div className='relative rounded-2xl bg-gradient-to-tr from-blue-100/50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 shadow-2xl backdrop-blur-sm'>
            <div className='rounded-lg bg-white dark:bg-gray-800 p-8 shadow-lg'>
              {/* Enhanced Mock Interface */}
              <div className='grid gap-6 md:grid-cols-2'>
                {/* Improved Product Card */}
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm'>
                  <div className='mb-4 h-32 rounded-lg bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 flex items-center justify-center'>
                    <div className='text-center'>
                      <div className='h-16 w-16 mx-auto mb-2 rounded-lg bg-white/20 flex items-center justify-center'>
                        <span className='text-2xl'>🎧</span>
                      </div>
                    </div>
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    Wireless Pro Headphones
                  </h3>
                  <div className='flex items-center justify-between mt-2'>
                    <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>$199</p>
                    <span className='text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded'>
                      In Stock
                    </span>
                  </div>
                  <div className='mt-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg'>
                    <div>
                      <span className='text-xs text-gray-500 dark:text-gray-400'>Magic Link</span>
                      <p className='font-mono text-sm font-medium text-gray-900 dark:text-white'>WPH2024</p>
                    </div>
                    <QrCode className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                  </div>
                </div>

                {/* Enhanced Chat Interface */}
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 shadow-sm'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center'>
                        <MessageSquare className='h-4 w-4 text-white' />
                      </div>
                      <h3 className='font-semibold text-gray-900 dark:text-white'>
                        AI Assistant Live
                      </h3>
                    </div>
                    <div className='flex items-center space-x-1'>
                      <div className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
                      <span className='text-xs text-green-600 dark:text-green-400'>Online</span>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <div className='rounded-lg bg-white dark:bg-gray-800 p-3 text-sm shadow-sm'>
                      <span className='text-gray-600 dark:text-gray-400'>&ldquo;Are these noise-canceling?&rdquo;</span>
                    </div>
                    <div className='rounded-lg bg-blue-50 dark:bg-blue-900/30 p-3 text-sm'>
                      <span className='text-blue-900 dark:text-blue-100'>&ldquo;Yes! These feature advanced ANC technology. Perfect for flights or focused work. Want to hear about our 30-day trial?&rdquo;</span>
                    </div>
                    <div className='rounded-lg bg-white dark:bg-gray-800 p-3 text-sm shadow-sm'>
                      <span className='text-gray-600 dark:text-gray-400'>&ldquo;How's the battery life?&rdquo;</span>
                    </div>
                    <div className='rounded-lg bg-blue-50 dark:bg-blue-900/30 p-3 text-sm'>
                      <span className='text-blue-900 dark:text-blue-100'>&ldquo;40 hours with ANC off, 30 hours with ANC on. Plus fast-charging: 5 minutes = 3 hours of playback! 🔋&rdquo;</span>
                    </div>
                  </div>
                  
                  {/* Show "typing" indicator */}
                  <div className='mt-3 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400'>
                    <div className='flex space-x-1'>
                      <div className='h-1 w-1 bg-gray-400 rounded-full animate-bounce'></div>
                      <div className='h-1 w-1 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
                      <div className='h-1 w-1 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span>AI preparing response...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Video Modal with Dark Mode */}
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
            <div className='aspect-video rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 overflow-hidden'>
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