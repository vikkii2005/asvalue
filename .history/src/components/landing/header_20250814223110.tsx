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
    <header className='fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Attractive Gradient Logo */}
          <Link href='/' className='flex items-center space-x-3'>
            <div className='relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl'>
              {/* Gradient overlay for more depth */}
              <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600/90 via-blue-500/70 to-transparent'></div>
              <Zap className='relative h-6 w-6 text-white drop-shadow-sm' />
              {/* Shine effect */}
              <div className='absolute top-1 left-1 h-3 w-3 rounded-full bg-white/30 blur-sm'></div>
            </div>
            <div className='flex flex-col'>
              <span className='text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'>
                {APP_CONFIG.name}
              </span>
              <span className='text-xs text-gray-500 -mt-1'>AI Sales Platform</span>
            </div>
          </Link>

          {/* Desktop Auth Buttons (Removed Navigation) */}
          <div className='hidden items-center space-x-4 md:flex'>
            {loading ? (
              <div className='h-10 w-28 animate-pulse rounded-lg bg-gray-200' />
            ) : user ? (
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-3'>
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="h-8 w-8 rounded-full border-2 border-blue-100"
                    />
                  )}
                  <div className='text-right'>
                    <p className='text-sm font-medium text-gray-900'>
                      {user.displayName}
                    </p>
                    <p className='text-xs text-gray-500'>Welcome back!</p>
                  </div>
                </div>
                <Link
                  href='/dashboard'
                  className='rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:-translate-y-0.5'
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className='rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:-translate-y-0.5'
              >
                Sign Up for Free
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden p-2 rounded-lg transition-colors hover:bg-gray-100'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label='Toggle menu'
          >
            {isMenuOpen ? (
              <X className='h-6 w-6 text-gray-600' />
            ) : (
              <Menu className='h-6 w-6 text-gray-600' />
            )}
          </button>
        </div>

        {/* Mobile Menu (Simplified without navigation items) */}
        {isMenuOpen && (
          <div className='md:hidden'>
            <div className='border-t border-gray-200 bg-white px-4 pb-4 pt-4 shadow-lg rounded-b-lg'>
              {user ? (
                <div className='space-y-4'>
                  {/* Mobile User Info */}
                  <div className='flex items-center space-x-3 p-3 bg-blue-50 rounded-lg'>
                    {user.photoURL && (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="h-10 w-10 rounded-full border-2 border-blue-100"
                      />
                    )}
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {user.displayName}
                      </p>
                      <p className='text-xs text-gray-500'>{user.email}</p>
                    </div>
                  </div>
                  
                  {/* Dashboard Button */}
                  <Link
                    href='/dashboard'
                    className='block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-center text-base font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* Welcome Message for Non-logged Users */}
                  <div className='text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      Welcome to {APP_CONFIG.name}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Transform your products into AI-powered sales machines
                    </p>
                  </div>
                  
                  {/* Sign Up Button */}
                  <button
                    onClick={() => {
                      signInWithGoogle()
                      setIsMenuOpen(false)
                    }}
                    className='block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-center text-base font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800'
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