'use client'

import { Upload, Bot, Share2, ArrowRight } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      step: 1,
      icon: Upload,
      title: 'Add Your Product',
      description:
        'Upload product photo, set your price, and create AI responses. Everything needed to start selling professionally.',
      time: '2 minutes',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      step: 2,
      icon: Bot,
      title: 'AI Gets Smart',
      description:
        'Our AI learns your product details and prepares to handle customer questions with intelligent responses.',
      time: '30 seconds',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      step: 3,
      icon: Share2,
      title: 'Start Earning',
      description:
        'Share your magic link anywhere - WhatsApp, Instagram, or any platform. Your AI handles the rest automatically.',
      time: 'Instantly',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
  ]

  return (
    <section id='how-it-works' className='bg-white py-20 dark:bg-gray-900'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl text-center'>
          <div className='mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-6 py-2 text-sm font-medium text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300'>
            ⚡ Simple 3-Step Process
          </div>

          <h2 className='mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl'>
            From Product to
            <span className='block bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-green-400'>
              Sales Machine
            </span>
          </h2>
          <p className='text-xl leading-relaxed text-gray-600 dark:text-gray-300'>
            Professional sales pages with AI assistance in under 5 minutes.
            <span className='font-semibold text-gray-900 dark:text-white'>
              No technical skills required.
            </span>
          </p>
        </div>

        <div className='mx-auto mt-20 max-w-6xl'>
          <div className='grid gap-12 lg:grid-cols-3'>
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className='relative'>
                  {/* Connection Arrow */}
                  {index < steps.length - 1 && (
                    <div className='absolute left-1/2 top-20 z-10 hidden lg:block'>
                      <ArrowRight className='h-6 w-6 translate-x-8 transform text-gray-400 dark:text-gray-600' />
                    </div>
                  )}

                  <div className='relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'>
                    {/* Step Number */}
                    <div className='absolute -top-4 left-8'>
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${step.color} text-sm font-bold text-white shadow-lg`}
                      >
                        {step.step}
                      </div>
                    </div>

                    {/* Icon */}
                    <div
                      className={`mb-6 flex h-16 w-16 items-center justify-center rounded-xl ${step.bgColor} border border-gray-200 dark:border-gray-600`}
                    >
                      <Icon
                        className={`h-8 w-8 ${step.step === 1 ? 'text-blue-600 dark:text-blue-400' : step.step === 2 ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`}
                      />
                    </div>

                    {/* Content */}
                    <h3 className='mb-4 text-xl font-bold text-gray-900 dark:text-white'>
                      {step.title}
                    </h3>
                    <p className='mb-6 leading-relaxed text-gray-600 dark:text-gray-300'>
                      {step.description}
                    </p>

                    {/* Time Badge */}
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${step.step === 1 ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : step.step === 2 ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}
                      >
                        ⚡ {step.time}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Enhanced Example Flow */}
        <div className='mx-auto mt-20 max-w-5xl'>
          <div className='rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
            <h3 className='mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white'>
              See It In Action
            </h3>

            <div className='grid gap-8 md:grid-cols-3'>
              <div className='group text-center'>
                <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-100 to-blue-200 transition-transform group-hover:scale-105 dark:border-blue-700 dark:from-blue-900/30 dark:to-blue-800/30'>
                  <span className='text-3xl'>📱</span>
                </div>
                <h4 className='mb-2 font-bold text-gray-900 dark:text-white'>
                  Upload Product
                </h4>
                <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
                  iPhone 15 Pro - $999
                  <br />
                  <span className='text-blue-600 dark:text-blue-400'>
                    3 AI questions ready
                  </span>
                </p>
              </div>

              <div className='group text-center'>
                <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-100 to-purple-200 transition-transform group-hover:scale-105 dark:border-purple-700 dark:from-purple-900/30 dark:to-purple-800/30'>
                  <span className='text-3xl'>🤖</span>
                </div>
                <h4 className='mb-2 font-bold text-gray-900 dark:text-white'>
                  AI Activated
                </h4>
                <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
                  Ready to answer:
                  <br />
                  <span className='text-purple-600 dark:text-purple-400'>
                    Size, shipping, warranty
                  </span>
                </p>
              </div>

              <div className='group text-center'>
                <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-green-200 bg-gradient-to-br from-green-100 to-green-200 transition-transform group-hover:scale-105 dark:border-green-700 dark:from-green-900/30 dark:to-green-800/30'>
                  <span className='text-3xl'>🚀</span>
                </div>
                <h4 className='mb-2 font-bold text-gray-900 dark:text-white'>
                  Start Selling
                </h4>
                <p className='text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
                  Magic link ready:
                  <br />
                  <span className='font-mono text-green-600 dark:text-green-400'>
                    asvalue.com/ABC123
                  </span>
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className='mt-8 text-center'>
              <p className='mb-4 text-sm text-gray-500 dark:text-gray-400'>
                Total setup time:{' '}
                <span className='font-bold text-gray-900 dark:text-white'>
                  Under 5 minutes
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
