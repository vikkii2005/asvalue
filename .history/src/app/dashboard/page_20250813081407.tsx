import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardOverview } from '@/components/dashboard/overview'
import { DashboardStats } from '@/components/dashboard/stats'
import { DashboardQuickActions } from '@/components/dashboard/quick-actions'
import { DashboardRecentActivity } from '@/components/dashboard/recent-activity'

export const metadata = {
  title: 'Dashboard | ASVALUE',
  description: 'Manage your AI-powered sales machines'
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <DashboardOverview user={user} />
      
      {/* Stats Grid */}
      <DashboardStats userId={user.id} />
      
      {/* Quick Actions */}
      <DashboardQuickActions />
      
      {/* Recent Activity */}
      <DashboardRecentActivity userId={user.id} />
    </div>
  )
}