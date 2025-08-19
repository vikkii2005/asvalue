// src/middleware.ts
// UPDATED - Protect seller-setup route

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('asvalue-authenticated')
    const hasValidSession = !!sessionCookie?.value

    const isSellerSetupRoute = request.nextUrl.pathname.startsWith('/onboarding/seller-setup')
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
    const isMarketplaceRoute = request.nextUrl.pathname.startsWith('/marketplace')

    console.log(
      `🔐 Auth check: ${request.nextUrl.pathname} | Session: ${hasValidSession ? 'Valid ✅' : 'None ❌'}`
    )

    // Protect routes that need authentication
    if (
      (isDashboardRoute || isMarketplaceRoute || isSellerSetupRoute) &&
      !hasValidSession
    ) {
      console.log('🚫 Redirecting to sign in')
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('❌ Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}