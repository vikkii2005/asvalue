'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import { Menu, X, Zap } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
  ]

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 flex h-8 w-8 items-center justify-center rounded-lg">
              <Zap className="text-white h-5 w-5" />
            </div>
            <span className="text-gray-900 text-xl font-bold">
              {APP_CONFIG.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="bg-gray-200 h-9 w-20 animate-pulse rounded-md" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Hi, {session.user?.name}</span>
                <Link
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <button
                onClick={() => signIn('google', { callbackUrl: '/profile' })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Join Free Beta
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="bg-white border-t border-gray-200 px-2 pb-3 pt-2 shadow-lg">
              <div className="space-y-1">
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:bg-gray-100 hover:text-blue-600 block rounded-md px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="mt-4">
                {session ? (
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white block w-full rounded-md px-3 py-2 text-center text-sm font-medium shadow transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      signIn('google', { callbackUrl: '/profile' })
                      setIsMenuOpen(false)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white block w-full rounded-md px-3 py-2 text-center text-sm font-medium shadow transition-colors"
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