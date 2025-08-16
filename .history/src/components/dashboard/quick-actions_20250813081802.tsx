'use client'

import Link from 'next/link'
import { Plus, QrCode, Share2, BarChart3 } from 'lucide-react'

export function DashboardQuickActions() {
  const actions = [
    {
      name: 'Create Product',
      description: 'Add a new AI-powered sales machine',
      href: '/dashboard/products/new',
      icon: Plus,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Generate QR Codes',
      description: 'Create QR codes for your products',
      href: '/dashboard/qr-codes',
      icon: QrCode,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Share Products',
      description: 'Get magic links to share anywhere',
      href: '/dashboard/products',
      icon: Share2,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      name: 'View Analytics',
      description: 'Track your sales performance',
      href: '/dashboard/analytics',
      icon: BarChart3,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Quick Actions
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.name}
              href={action.href}
              className="group rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:shadow-primary/5"
            >
              <div className="flex items-start space-x-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}