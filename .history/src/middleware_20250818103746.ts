// src/middleware.ts
// Fixed - Allow access to onboarding pages

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Simple session check using cookie
    const sessionToken = request.cookies.get('sb-access-token');
    const hasSession = !!sessionToken;

    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
    const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding');
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

    console.log(`🔐 Auth check: ${request.nextUrl.pathname} | Session: ${hasSession ? 'Valid ✅' : 'None ❌'}`);

    // Handle protected routes (dashboard)
    if (isProtectedRoute && !hasSession) {
      console.log('🚫 Blocking unauthenticated access to protected route');
      const redirectUrl = new URL('/auth/signin', request.url);
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // ✅ FIXED: Allow authenticated users to access onboarding pages
    if (isOnboardingRoute && hasSession) {
      console.log('✅ Allowing access to onboarding page');
      return NextResponse.next();
    }

    // Only redirect from signin page if authenticated
    if (isAuthRoute && hasSession && request.nextUrl.pathname === '/auth/signin') {
      console.log('🔄 Redirecting authenticated user to success page');
      return NextResponse.redirect(new URL('/auth/success', request.url));
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
