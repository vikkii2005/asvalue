'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/components/auth/FirebaseAuthProvider'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  User,
  LogOut,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthContext()

  return (
    <div className='min-h-screen w-64 border-r border-gray-200 bg-white'>
      <div className='p-6'>
        <h1 className='text-xl font-bold text-gray-900'>ASVALUE</h1>
        <p className='mt-1 text-sm text-gray-500'>Dashboard</p>
        
        {/* User info */}
        {user && (
          <div className='mt-4 flex items-center space-x-3'>
            <div className='h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center'>
              <span className='text-white text-sm font-medium'>
                {user.displayName?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-900'>
                {user.displayName}
              </p>
              <p className='text-xs text-gray-500'>
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>

      <nav className='space-y-2 px-4'>
        {navigation.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-r-2 border-blue-700 bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className='mr-3 h-5 w-5' />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className='absolute bottom-4 left-4 right-4'>
        <button
          onClick={logout}
          className='flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
        >
          <LogOut className='mr-3 h-5 w-5' />
          Sign Out
        </button>
      </div>
    </div>
  )
}