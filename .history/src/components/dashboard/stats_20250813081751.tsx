'use client'

import { Package, Eye, MessageSquare, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
  userId: string
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  // Mock data for now - will connect to real data later
  const stats = [
    {
      name: 'Products',
      value: '0',
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Total Views',
      value: '0',
      icon: Eye,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Conversations',
      value: '0',
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Conversion Rate',
      value: '0%',
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.name} className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}