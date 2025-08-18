// src/middleware.ts
// FIXED - Simple and reliable session checking

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Only check for a real, working session cookie
    const sessionCookie = request.cookies.get('asvalue-authenticated');
    const hasValidSession = !!sessionCookie?.value;

    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
    const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding');
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
    const isMarketplaceRoute = request.nextUrl.pathname.startsWith('/marketplace');

    console.log(`🔐 Auth check: ${request.nextUrl.pathname} | Session: ${hasValidSession ? 'Valid ✅' : 'None ❌'}`);

    // Protect dashboard and marketplace
    if ((isDashboardRoute || isMarketplaceRoute) && !hasValidSession) {
      console.log('🚫 Redirecting to sign in');
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Allow onboarding only if authenticated
    if (isOnboardingRoute && !hasValidSession) {
      console.log('🚫 Onboarding requires authentication');
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