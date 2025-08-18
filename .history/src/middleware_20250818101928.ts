// src/middleware.ts
// Smart middleware without success page

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('sb-access-token');
    const hasSession = !!sessionToken;

    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
    const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding');
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
    const isMarketplaceRoute = request.nextUrl.pathname.startsWith('/marketplace');

    console.log(`🔐 Auth check: ${request.nextUrl.pathname} | Session: ${hasSession ? 'Valid ✅' : 'None ❌'}`);

    // Protect dashboard and marketplace
    if ((isDashboardRoute || isMarketplaceRoute) && !hasSession) {
      console.log('🚫 Redirecting to sign in');
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Allow onboarding if authenticated
    if (isOnboardingRoute && hasSession) {
      console.log('✅ Allowing access to onboarding');
      return NextResponse.next();
    }

    // Redirect from signin if already authenticated
    if (hasSession && request.nextUrl.pathname === '/auth/signin') {
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