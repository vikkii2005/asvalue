// src/middleware.ts
// Route protection and auth checks

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });

    // Refresh session if expired - required for Server Components
    const { data: { session }, error: _error } = await supabase.auth.getSession(); // ✅ FIXED!

    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                            request.nextUrl.pathname.startsWith('/profile') ||
                            request.nextUrl.pathname.startsWith('/settings');

    // Log authentication attempt for security monitoring
    if (isAuthRoute || isProtectedRoute) {
      console.log(`🔐 Auth check: ${request.nextUrl.pathname} | Session: ${session ? 'Valid' : 'None'}`);
    }

    // Handle authentication routes
    if (isAuthRoute) {
      // Redirect authenticated users away from auth pages
      if (session && request.nextUrl.pathname === '/auth/signin') {
        console.log('🔄 Redirecting authenticated user to success page');
        return NextResponse.redirect(new URL('/auth/success', request.url));
      }

      // Allow access to auth routes for non-authenticated users
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

      // Check if user profile is complete for certain routes
      if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (!profile?.onboarding_completed && request.nextUrl.pathname !== '/dashboard/onboarding') {
          console.log('🔄 Redirecting to onboarding');
          return NextResponse.redirect(new URL('/dashboard/onboarding', request.url));
        }
      }
    }

    // Add security headers
    const response = NextResponse.next();
    
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
    // Log middleware errors
    console.error('❌ Middleware error:', error);
    
    // Continue to the route on middleware errors (graceful degradation)
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};