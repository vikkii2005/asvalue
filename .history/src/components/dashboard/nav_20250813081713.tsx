'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Bell, Search, Settings, Zap, LogOut, User } from 'lucide-react'
import { APP_CONFIG } from '@/lib/constants'
import { formatUserDisplayName } from '@/lib/auth'
import type { User as UserType } from '@/types/auth'

interface DashboardNavProps {
  user: UserType
}

export function DashboardNav({ user }: DashboardNavProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            {APP_CONFIG.name}
          </span>
        </Link>

        {/* Search Bar - Hidden on mobile for now */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative rounded-lg p-2 hover:bg-accent">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
          </button>

          {/* Settings */}
          <Link 
            href="/dashboard/settings"
            className="rounded-lg p-2 hover:bg-accent"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Link>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 rounded-lg p-2 hover:bg-accent"
            >
              {/* Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.email}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              
              {/* User info - Hidden on mobile */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">
                  {formatUserDisplayName(user)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-background py-2 shadow-lg z-50">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </Link>
                <hr className="my-2" />
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}