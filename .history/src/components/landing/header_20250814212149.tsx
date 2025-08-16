'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthContext } from '@/components/auth/FirebaseAuthProvider'
import { Menu, X, Zap } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading, signInWithGoogle } = useAuthContext()

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
  ]

  return (
    <header className='fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600'>
              <Zap className='h-5 w-5 text-white' />
            </div>
            <span className='text-xl font-bold text-gray-900'>
              {APP_CONFIG.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden items-center space-x-8 md:flex'>
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className='text-sm font-medium text-gray-700 transition-colors hover:text-blue-600'
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className='hidden items-center space-x-4 md:flex'>
            {loading ? (
              <div className='h-9 w-20 animate-pulse rounded-md bg-gray-200' />
            ) : user ? (
              <div className='flex items-center space-x-4'>
                <span className='text-gray-700'>Hi, {user.displayName}</span>
                <Link
                  href='/dashboard'
                  className='rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700'
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className='rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-blue-700 hover:shadow-lg'
              >
                Join Free Beta
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label='Toggle menu'
          >
            {isMenuOpen ? (
              <X className='h-6 w-6' />
            ) : (
              <Menu className='h-6 w-6' />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className='md:hidden'>
            <div className='border-t border-gray-200 bg-white px-2 pb-3 pt-2 shadow-lg'>
              <div className='space-y-1'>
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className='block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className='mt-4'>
                {user ? (
                  <Link
                    href='/dashboard'
                    className='block w-full rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white shadow transition-colors hover:bg-blue-700'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      signInWithGoogle()
                      setIsMenuOpen(false)
                    }}
                    className='block w-full rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white shadow transition-colors hover:bg-blue-700'
                  >
                    Join Free Beta
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}