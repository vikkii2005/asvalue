import { APP_CONFIG } from '@/lib/constants'

export const metadata = {
  title: `Sign In | ${APP_CONFIG.name}`,
  description: 'Sign in to your ASVALUE account',
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <h1 className="text-4xl font-bold mb-6">{APP_CONFIG.name}</h1>
          <p className="text-xl mb-8">
            Turn your products into AI-powered sales machines
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
              <span>Create magic links in 5 minutes</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
              <span>24/7 AI customer service</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
              <span>Zero commission forever</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}