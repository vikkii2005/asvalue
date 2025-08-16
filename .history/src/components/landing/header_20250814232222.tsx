'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthContext } from '@/components/auth/FirebaseAuthProvider'
import { Menu, X, Zap } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading, signInWithGoogle } = useAuthContext()

  return (
    <header className='fixed top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-850/70 backdrop-blur-sm'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Attractive Gradient Logo */}
          <Link href='/' className='flex items-center space-x-3'>
            <div className='relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-white dark:from-blue-500 dark:via-blue-600 dark:to-blue-400 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl'>
              {/* Gradient overlay for more depth */}
              <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600/90 via-blue-500/70 to-transparent dark:from-blue-500/90 dark:via-blue-600/70'></div>
              <Zap className='relative h-6 w-6 text-white drop-shadow-sm' />
              {/* Shine effect */}
              <div className='absolute top-1 left-1 h-3 w-3 rounded-full bg-white/30 blur-sm'></div>
            </div>
            <div className='flex flex-col'>
              <span className='text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent'>
                {APP_CONFIG.name}
              </span>
              <span className='text-xs text-gray-500 dark:text-gray-400 -mt-1'>AI Sales Platform</span>
            </div>
          </Link>

          {/* Desktop Auth Buttons (Removed Navigation) */}
          <div className='hidden items-center space-x-4 md:flex'>
            {loading ? (
              <div className='h-10 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700' />
            ) : user ? (
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-3'>
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="h-8 w-8 rounded-full border-2 border-blue-100 dark:border-blue-400/30"
                    />
                  )}
                  <div className='text-right'>
                    <p className='text-sm font-medium text-gray-900 dark:text-white'>
                      {user.displayName}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>Welcome back!</p>
                  </div>
                </div>
                <Link
                  href='/dashboard'
                  className='rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5'
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className='rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5'
              >
                Sign Up for Free
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
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

        {/* Mobile Menu (Simplified without navigation items) */}
        {isMenuOpen && (
          <div className='md:hidden'>
            <div className='border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 pb-4 pt-4 shadow-lg rounded-b-lg'>
              {user ? (
                <div className='space-y-4'>
                  {/* Mobile User Info */}
                  <div className='flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
                    {user.photoURL && (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="h-10 w-10 rounded-full border-2 border-blue-100 dark:border-blue-400/30"
                      />
                    )}
                    <div>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        {user.displayName}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>{user.email}</p>
                    </div>
                  </div>
                  
                  {/* Dashboard Button */}
                  <Link
                    href='/dashboard'
                    className='block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-3 text-center text-base font-medium text-white shadow-lg transition-all duration-300'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* Welcome Message for Non-logged Users */}
                  <div className='text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-400/20'>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                      Welcome to {APP_CONFIG.name}
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Transform your products into AI-powered sales machines
                    </p>
                  </div>
                  
                  {/* Sign Up Button */}
                  <button
                    onClick={() => {
                      signInWithGoogle()
                      setIsMenuOpen(false)
                    }}
                    className='block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-3 text-center text-base font-medium text-white shadow-lg transition-all duration-300'
                  >
                    Sign Up for Free
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}