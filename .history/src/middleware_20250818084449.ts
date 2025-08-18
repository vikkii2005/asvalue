// src/middleware.ts
// Next.js 15 compatible middleware

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });

    // Refresh session if expired - required for Server Components
    const { data: { session }, error: _error } = await supabase.auth.getSession();

    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                            request.nextUrl.pathname.startsWith('/profile') ||
                            request.nextUrl.pathname.startsWith('/settings');

    // Log authentication attempt for security monitoring
    if (isAuthRoute || isProtectedRoute) {
      console.log(`🔐 Auth check: ${request.nextUrl.pathname} | Session: ${session ? 'Valid ✅' : 'None ❌'}`);
    }

    // Handle authentication routes
    if (isAuthRoute) {
      // Redirect authenticated users away from auth pages (except success and callback)
      if (session && 
          request.nextUrl.pathname === '/auth/signin' && 
          !request.nextUrl.searchParams.has('redirectTo')) {
        console.log('🔄 Redirecting authenticated user to success page');
        return NextResponse.redirect(new URL('/auth/success', request.url));
      }

      // Allow access to auth routes
      return res;
    }

    // Handle protected routes
    if (isProtectedRoute) {
      if (!session) {
        console.log('🚫 Blocking unauthenticated access to protected route');
        
        // Store the attempted URL for post-auth redirect
        const redirectUrl = new URL('/auth/signin', request.url);
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
        
        return NextResponse.redirect(redirectUrl);
      }

      console.log('✅ Allowing authenticated access to protected route');
    }

    // Add security headers
    const response = res;
    
    // CSRF Protection
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Only add HSTS in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    return response;

  } catch (error) {
    console.error('❌ Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};