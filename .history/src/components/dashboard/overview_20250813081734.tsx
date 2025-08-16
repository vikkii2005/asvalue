'use client'

import { Sparkles, Zap } from 'lucide-react'
import type { User } from '@/types/auth'
import { formatUserDisplayName, isProfileComplete } from '@/lib/auth'

interface DashboardOverviewProps {
  user: User
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const profileComplete = isProfileComplete(user)
  
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {formatUserDisplayName(user)}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to create some AI sales machines? 🚀
          </p>
        </div>
        
        {/* Beta Badge */}
        <div className="flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Sparkles className="mr-2 h-4 w-4" />
          Beta User
        </div>
      </div>

      {/* Profile Completion Prompt */}
      {!profileComplete && (
        <div className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                Complete Your Profile
              </h3>
              <p className="text-muted-foreground mt-1">
                Add your business details to unlock all features and create your first AI sales machine.
              </p>
              <button className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90">
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}