'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className='fixed top-0 z-50 w-full border-b border-gray-200 bg-white/70 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo with Favicon */}
          <Link href='/' className='flex items-center space-x-3'>
            <div className='relative flex h-10 w-10 transform items-center justify-center transition-all duration-300 hover:scale-105'>
              <Image
                src='/favicon.png'
                alt='ASVALUE Logo'
                width={40}
                height={40}
                className='h-20 w-20 object-contain'
                priority
              />
            </div>
            <div className='flex flex-col'>
              <span className='bg-gradient-to-r  bg-clip-text text-xl font-bold text-WHITE'>
                ASVALUE
              </span>
              <span className='-mt-1 text-xs text-gray-500 dark:text-gray-400'>
                AI Sales Platform
              </span>
            </div>
          </Link>

          {/* Desktop CTA Button */}
          <div className='hidden items-center space-x-4 md:flex'>
            <button className='rounded-lg bg-white px-6 py-2.5 font-semibold text-blue-500 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl'>
              Sign Up for Free
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className='rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden dark:hover:bg-gray-800'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label='Toggle menu'
          >
            {isMenuOpen ? (
              <X className='h-6 w-6 text-gray-600 dark:text-gray-300' />
            ) : (
              <Menu className='h-6 w-6 text-gray-600 dark:text-gray-300' />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className='md:hidden'>
            <div className='rounded-b-lg border-t border-gray-200 bg-white px-4 pb-4 pt-4 shadow-lg dark:border-gray-700 dark:bg-gray-900'>
              <div className='space-y-4'>
                {/* Welcome Message */}
                <div className='rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-center dark:border-blue-400/20 dark:from-blue-900/20 dark:to-indigo-900/20'>
                  <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                    Welcome to ASVALUE
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>
                    Transform your products into AI-powered sales machines
                  </p>
                </div>

                {/* Sign Up Button */}
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className='block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-center text-base font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800'
                >
                  Sign Up for Free
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}