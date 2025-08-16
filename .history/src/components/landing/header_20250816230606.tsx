'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, Sparkles, Bot } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className='fixed top-0 z-50 w-full border-b border-gray-200 bg-white/70 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Enhanced ASVALUE Logo */}
          <Link href='/' className='flex items-center space-x-3 group'>
            <div className='relative flex h-12 w-12 transform items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:from-purple-500 dark:via-blue-500 dark:to-cyan-400'>
              {/* Animated gradient overlay */}
              <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/90 via-blue-600/70 to-cyan-500/80 animate-pulse dark:from-purple-500/90 dark:via-blue-500/70'></div>
              
              {/* Main icon container */}
              <div className='relative flex items-center justify-center'>
                <ShoppingCart className='relative h-4 w-4 text-white drop-shadow-sm' />
                <Bot className='absolute -top-1 -right-1 h-3 w-3 text-yellow-300 drop-shadow-sm' />
                <Sparkles className='absolute -bottom-1 -left-1 h-2 w-2 text-cyan-300 drop-shadow-sm animate-ping' />
              </div>
              
              {/* Shine effects */}
              <div className='absolute left-2 top-2 h-3 w-3 rounded-full bg-white/40 blur-sm'></div>
              <div className='absolute right-1 bottom-1 h-2 w-2 rounded-full bg-cyan-300/60 blur-sm'></div>
            </div>
            
            <div className='flex flex-col'>
              <div className='flex items-center space-x-1'>
                <span className='bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-xl font-bold text-transparent group-hover:from-purple-700 group-hover:via-blue-700 group-hover:to-cyan-700 transition-all duration-300 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400'>
                  AS
                </span>
                <span className='bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent group-hover:from-cyan-700 group-hover:via-blue-700 group-hover:to-purple-700 transition-all duration-300 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400'>
                  VALUE
                </span>
                <div className='ml-1 flex h-2 w-2 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-500'>
                  <div className='h-1 w-1 rounded-full bg-white animate-pulse'></div>
                </div>
              </div>
              <span className='-mt-1 text-xs font-medium text-gray-500 dark:text-gray-400'>
                AI E-commerce Assistant
              </span>
            </div>
          </Link>

          {/* Desktop CTA Button */}
          <div className='hidden items-center space-x-4 md:flex'>
            <button className='group relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 px-6 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl'>
              <span className='relative z-10'>Start Free Trial</span>
              <div className='absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
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
                <div className='rounded-lg border border-purple-100 bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 p-4 text-center dark:border-purple-400/20 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20'>
                  <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                    Welcome to ASVALUE
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>
                    Transform your e-commerce with AI-powered sales assistance
                  </p>
                </div>

                {/* Sign Up Button */}
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className='block w-full rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 px-4 py-3 text-center text-base font-medium text-white shadow-lg transition-all duration-300 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700'
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}