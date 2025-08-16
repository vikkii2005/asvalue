'use client'

import { Clock, Package, MessageSquare } from 'lucide-react'

interface DashboardRecentActivityProps {
  userId: string
}

export function DashboardRecentActivity({ userId }: DashboardRecentActivityProps) {
  // Mock data for now - will connect to real data later
  const activities = [
    {
      id: '1',
      type: 'welcome',
      title: 'Welcome to ASVALUE!',
      description: 'You joined the beta program. Start by creating your first product.',
      time: 'Just now',
      icon: Package
    }
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Recent Activity
      </h2>
      
      {activities.length > 0 ? (
        <div className="rounded-lg border bg-card">
          {activities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <div 
                key={activity.id} 
                className={`flex items-start space-x-4 p-6 ${
                  index < activities.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No activity yet
          </h3>
          <p className="text-muted-foreground mt-2">
            Start creating products to see your activity here.
          </p>
        </div>
      )}
    </div>
  )
}