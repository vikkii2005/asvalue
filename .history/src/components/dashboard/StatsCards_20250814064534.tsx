'use client'
import { TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react'

interface StatsCardsProps {
  stats?: {
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    conversionRate: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const defaultStats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    conversionRate: 0
  }

  const data = stats || defaultStats

  const cards = [
    {
      title: 'Total Products',
      value: data.totalProducts.toString(),
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Orders',
      value: data.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Revenue',
      value: `$${data.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+23%',
      changeType: 'positive' as const
    },
    {
      title: 'Conversion Rate',
      value: `${data.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+5%',
      changeType: 'positive' as const
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from last month</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}