// src/middleware.ts
// FIXED - Let auth/success handle smart redirects

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('asvalue-authenticated')
    const hasValidSession = !!sessionCookie?.value

    const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding')
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
    const isMarketplaceRoute = request.nextUrl.pathname.startsWith('/marketplace')

    console.log(
      `🔐 Auth check: ${request.nextUrl.pathname} | Session: ${hasValidSession ? 'Valid ✅' : 'None ❌'}`
    )

    // Protect routes that need authentication
    if (
      (isDashboardRoute || isMarketplaceRoute || isOnboardingRoute) &&
      !hasValidSession
    ) {
      console.log('🚫 Redirecting to sign in')
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // ✅ FIXED: Removed the problematic redirect from signin
    // Let auth/success page handle smart redirects based on role
    // This was causing users to bypass the role-checking logic

    return NextResponse.next()
  } catch (error) {
    console.error('❌ Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)',],
}