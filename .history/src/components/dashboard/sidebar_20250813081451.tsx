'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  MessageSquare,
  Settings,
  Plus,
  QrCode
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/types/auth'

interface DashboardSidebarProps {
  user: User
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard'
    },
    {
      name: 'Products',
      href: '/dashboard/products',
      icon: Package,
      current: pathname.startsWith('/dashboard/products')
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: ShoppingCart,
      current: pathname.startsWith('/dashboard/orders')
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      current: pathname.startsWith('/dashboard/analytics')
    },
    {
      name: 'Conversations',
      href: '/dashboard/conversations',
      icon: MessageSquare,
      current: pathname.startsWith('/dashboard/conversations')
    }
  ]

  const quickActions = [
    {
      name: 'New Product',
      href: '/dashboard/products/new',
      icon: Plus,
      color: 'text-primary'
    },
    {
      name: 'QR Codes',
      href: '/dashboard/qr-codes',
      icon: QrCode,
      color: 'text-purple-500'
    }
  ]

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:top-16">
      <div className="flex flex-col flex-grow border-r bg-background overflow-y-auto">
        <div className="flex flex-col flex-grow pt-5 pb-4 px-4">
          {/* Main Navigation */}
          <nav className="flex-1 space-y-1" aria-label="Sidebar">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    item.current
                      ? 'bg-primary/10 text-primary border-r-2 border-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-l-lg transition-colors'
                  )}
                >
                  <Icon
                    className={cn(
                      item.current
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground',
                      'mr-3 h-5 w-5 transition-colors'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="mt-3 space-y-1">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="group flex items-center px-3 py-2 text-sm font-medium text-muted-foreground rounded-l-lg hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <Icon className={cn('mr-3 h-5 w-5', action.color)} />
                    {action.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Settings */}
          <div className="mt-8 pt-4 border-t">
            <Link
              href="/dashboard/settings"
              className={cn(
                pathname.startsWith('/dashboard/settings')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                'group flex items-center px-3 py-2 text-sm font-medium rounded-l-lg transition-colors'
              )}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </div>

          {/* User Info */}
          <div className="mt-4 p-3 bg-accent/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Beta User</p>
            <p className="text-sm font-medium text-foreground truncate">
              {user.name || user.email}
            </p>
            {user.business_name && (
              <p className="text-xs text-muted-foreground truncate">
                {user.business_name}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}