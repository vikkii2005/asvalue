import Link from 'next/link'
import { Zap } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-gray-900 dark:bg-gray-950 text-white border-t border-gray-800 dark:border-gray-900'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid gap-8 md:grid-cols-4'>
          {/* Brand */}
          <div className='md:col-span-2'>
            <Link href='/' className='mb-4 flex items-center space-x-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'>
                <Zap className='h-5 w-5 text-white' />
              </div>
              <span className='text-xl font-bold text-white'>
                {APP_CONFIG.name}
              </span>
            </Link>
            <p className='mb-6 max-w-md text-sm leading-relaxed text-gray-400 dark:text-gray-300'>
              Professional AI-powered sales platform. Create magic links, 
              get instant QR codes, and let AI handle customer questions 24/7. 
              Everything you need to sell online.
            </p>
            <div className='flex items-center text-sm font-medium text-blue-400 dark:text-blue-300'>
              <span className='mr-2 h-2 w-2 rounded-full bg-green-500 animate-pulse' />
              ✨ Live & Ready - Start Selling Today
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className='mb-4 text-sm font-semibold text-white uppercase tracking-wider'>
              Platform
            </h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='#features'
                  className='text-sm text-gray-400 dark:text-gray-300 transition-colors hover:text-white dark:hover:text-blue-300'
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href='#how-it-works'
                  className='text-sm text-gray-400 dark:text-gray-300 transition-colors hover:text-white dark:hover:text-blue-300'
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href='/dashboard'
                  className='text-sm text-gray-400 dark:text-gray-300 transition-colors hover:text-white dark:hover:text-blue-300'
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  Analytics (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='mb-4 text-sm font-semibold text-white uppercase tracking-wider'>
              Support
            </h3>
            <ul className='space-y-3'>
              <li>
                <a
                  href={`mailto:${APP_CONFIG.support_email || 'support@asvalue.com'}`}
                  className='text-sm text-gray-400 dark:text-gray-300 transition-colors hover:text-white dark:hover:text-blue-300'
                >
                  Customer Support
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${APP_CONFIG.contact_email || 'hello@asvalue.com'}`}
                  className='text-sm text-gray-400 dark:text-gray-300 transition-colors hover:text-white dark:hover:text-blue-300'
                >
                  Contact Us
                </a>
              </li>
              <li>
                <Link
                  href='/help'
                  className='text-sm text-gray-400 dark:text-gray-300 transition-colors hover:text-white dark:hover:text-blue-300'
                >
                  Help Center
                </Link>
              </li>
              <li>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  Documentation (Coming Soon)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className='mt-12 flex flex-wrap justify-center gap-6 border-t border-gray-800 dark:border-gray-900 pt-8'>
          <Link
            href='/privacy'
            className='text-sm text-gray-400 dark:text-gray-300 transition-colors hover:text-white dark:hover:text-blue-300'
          >
            Privacy Policy
          </Link>
          <Link
            href='/terms'
            className='text-sm text-gray-400 dark:text-gray-300 transition-colors hover:text-white dark:hover:text-blue-300'
          >
            Terms of Service
          </Link>
          <Link
            href='/refunds'
            className='text-sm text-gray-400 dark:text-gray-300 transition-colors hover:text-white dark:hover:text-blue-300'
          >
            Refund Policy
          </Link>
        </div>

        {/* Copyright */}
        <div className='mt-8 border-t border-gray-800 dark:border-gray-900 pt-8 text-center'>
          <p className='text-sm text-gray-400 dark:text-gray-300'>
            © {currentYear} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
            Professional AI sales platform for modern entrepreneurs
          </p>
        </div>
      </div>
    </footer>
  )
}