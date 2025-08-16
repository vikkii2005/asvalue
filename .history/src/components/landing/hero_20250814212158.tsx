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
} from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export default function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const { signInWithGoogle, loading } = useAuthContext()

  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-16 pt-20 md:pb-20 md:pt-32'>
      {/* Background decoration */}
      <div className='absolute inset-0 opacity-40'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>
      <div className='absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl' />
      <div className='absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl' />

      <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          {/* Badge */}
          <div className='mb-8 inline-flex items-center rounded-full border border-blue-200 bg-blue-50/50 px-4 py-1.5 text-sm shadow-sm backdrop-blur-sm'>
            <Sparkles className='mr-2 h-4 w-4 text-blue-600' />
            <span className='font-medium text-blue-800'>
              Free Beta • Join First 20 Sellers
            </span>
          </div>

          {/* Main Headline */}
          <h1 className='mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl lg:text-7xl'>
            Turn Your Products Into{' '}
            <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
              AI Sales Machines
            </span>
          </h1>

          {/* Subheadline */}
          <p className='mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600 md:text-2xl'>
            Create magic links in 5 minutes. Get instant QR codes. Let AI handle
            customer questions 24/7. Start selling anywhere, anytime.
          </p>

          {/* Stats */}
          <div className='mb-10 flex flex-wrap justify-center gap-8 text-sm text-gray-600'>
            <div className='flex items-center'>
              <TrendingUp className='mr-2 h-4 w-4 text-green-500' />
              300% conversion increase
            </div>
            <div className='flex items-center'>
              <MessageSquare className='mr-2 h-4 w-4 text-blue-500' />
              24/7 AI customer service
            </div>
            <div className='flex items-center'>
              <QrCode className='mr-2 h-4 w-4 text-purple-500' />
              Instant QR codes
            </div>
          </div>

          {/* CTA Buttons */}
          <div className='mb-8 flex flex-col justify-center gap-4 sm:flex-row'>
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className='group inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:opacity-50'
            >
              {loading ? 'Signing in...' : 'Join Free Beta Now'}
              <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
            </button>

            <button
              onClick={() => setIsVideoPlaying(true)}
              className='group inline-flex h-12 items-center justify-center rounded-lg border border-gray-300 bg-white px-8 text-base font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md'
            >
              <Play className='mr-2 h-4 w-4' />
              Watch Demo
            </button>
          </div>

          {/* Social Proof */}
          <p className='text-sm text-gray-500'>
            Be among the first 20 beta users to shape {APP_CONFIG.name}
          </p>
        </div>

        {/* Hero Visual */}
        <div className='mx-auto mt-16 max-w-6xl'>
          <div className='relative rounded-2xl bg-gradient-to-tr from-blue-100/50 to-indigo-100/50 p-4 shadow-2xl backdrop-blur-sm'>
            <div className='rounded-lg bg-white p-8 shadow-lg'>
              {/* Mock Interface */}
              <div className='grid gap-6 md:grid-cols-2'>
                {/* Product Card */}
                <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm'>
                  <div className='mb-4 h-32 rounded-lg bg-gradient-to-br from-blue-200 to-indigo-200' />
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Premium Headphones
                  </h3>
                  <p className='mt-1 text-2xl font-bold text-blue-600'>$299</p>
                  <div className='mt-4 flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>
                      Magic Code: ABCD123456
                    </span>
                    <QrCode className='h-8 w-8 text-blue-600' />
                  </div>
                </div>

                {/* Chat Interface */}
                <div className='rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm'>
                  <div className='mb-4 flex items-center justify-between'>
                    <h3 className='font-semibold text-gray-900'>
                      AI Customer Chat
                    </h3>
                    <div className='h-2 w-2 rounded-full bg-green-500' />
                  </div>
                  <div className='space-y-3'>
                    <div className='rounded-lg bg-white p-3 text-sm shadow-sm'>
                      "What size should I order?"
                    </div>
                    <div className='rounded-lg bg-blue-50 p-3 text-sm'>
                      "Check our size chart - these run true to size.
                      Would you like me to help you find the perfect fit?"
                    </div>
                    <div className='rounded-lg bg-white p-3 text-sm shadow-sm'>
                      "How much is shipping?"
                    </div>
                    <div className='rounded-lg bg-blue-50 p-3 text-sm'>
                      "Free shipping on orders over $50! Your order
                      qualifies ✨"
                    </div>
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
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'
          onClick={() => setIsVideoPlaying(false)}
        >
          <div className='relative w-full max-w-4xl'>
            <button
              onClick={() => setIsVideoPlaying(false)}
              className='absolute -top-12 right-0 text-white hover:text-gray-300'
            >
              <X className='h-8 w-8' />
            </button>
            <div className='aspect-video rounded-lg bg-black'>
              <div className='flex h-full items-center justify-center text-white'>
                <p>Demo video would play here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}