import Link from 'next/link'
import { Zap } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='border-t border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid gap-8 md:grid-cols-4'>
          {/* Brand */}
          <div className='md:col-span-2'>
            <Link href='/' className='mb-4 flex items-center space-x-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'>
                <Zap className='h-5 w-5 text-white' />
              </div>
              <span className='text-xl font-bold text-gray-900 dark:text-white'>
                {APP_CONFIG.name}
              </span>
            </Link>
            <p className='mb-6 max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
              Professional AI-powered sales platform. Create magic links, get
              instant QR codes, and let AI handle customer questions 24/7.
              Everything you need to sell online.
            </p>
            <div className='flex items-center text-sm font-medium text-blue-600 dark:text-blue-400'>
              <span className='mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500' />
              ✨ Live & Ready - Start Selling Today
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className='mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white'>
              Platform
            </h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='#features'
                  className='text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-blue-300'
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href='#how-it-works'
                  className='text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-blue-300'
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href='/dashboard'
                  className='text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-blue-300'
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

          {/* Support - SINGLE EMAIL ONLY */}
          <div>
            <h3 className='mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white'>
              Support
            </h3>
            <ul className='space-y-3'>
              <li>
                <a
                  href='mailto:hello@asvalue.com'
                  className='text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-blue-300'
                >
                  Contact Support
                </a>
              </li>
              <li>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  Documentation (Coming Soon)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className='mt-8 border-t border-gray-200 pt-8 text-center dark:border-gray-800'>
          <p className='text-sm text-gray-600 dark:text-gray-300'>
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
