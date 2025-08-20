import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { pathname } = request.nextUrl

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  // Define route types
  const isAuthRoute = pathname.startsWith('/auth')
  const isProtectedRoute = pathname.startsWith('/onboarding') || pathname.startsWith('/dashboard')
  const isPublicRoute = pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/api')

  // Allow public routes and auth routes to pass through
  if (isPublicRoute || isAuthRoute) {
    return res
  }

  // Protect non-auth routes - redirect to signin if no session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}