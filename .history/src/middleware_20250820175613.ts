import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = request.nextUrl

  // CRITICAL: Allow ALL auth routes to pass through without any checks
  if (pathname.startsWith('/auth') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname === '/' ||
      pathname.includes('.')) {
    return res
  }

  // Only check session for protected routes
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Protect only specific routes
  if ((pathname.startsWith('/onboarding') || pathname.startsWith('/dashboard')) && !session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return res
}

export const config = {
  matcher: [
    '/onboarding/:path*',
    '/dashboard/:path*'
  ],
}