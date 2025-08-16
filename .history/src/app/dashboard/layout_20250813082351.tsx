import { redirect } from 'next/navigation'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/nav'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Require authentication
  try {
    await requireAuth()
  } catch {
    redirect('/auth/signin')
  }

  // Get current user
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <DashboardNav user={user} />
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <DashboardSidebar user={user} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}