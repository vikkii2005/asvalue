// src/middleware.ts
// Simple middleware - just check for our cookie

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('asvalue-authenticated');
    const hasValidSession = !!sessionCookie?.value;

    const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding');
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
    const isMarketplaceRoute = request.nextUrl.pathname.startsWith('/marketplace');

    console.log(`🔐 Auth check: ${request.nextUrl.pathname} | Session: ${hasValidSession ? 'Valid ✅' : 'None ❌'}`);

    // Protect routes
    if ((isDashboardRoute || isMarketplaceRoute || isOnboardingRoute) && !hasValidSession) {
      console.log('🚫 Redirecting to sign in');
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Redirect from signin if already authenticated
    if (hasValidSession && request.nextUrl.pathname === '/auth/signin') {
      console.log('🔄 Already authenticated, redirecting to role selection');
      return NextResponse.redirect(new URL('/onboarding/role-selection', request.url));
    }

    return NextResponse.next();

  } catch (error) {
    console.error('❌ Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)',],
};