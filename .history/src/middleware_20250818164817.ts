// src/middleware.ts - NEXT.JS 15 COMPATIBLE
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // ✅ FIXED: Await cookies for Next.js 15
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  console.log(`🔐 Auth check: ${req.nextUrl.pathname} | Session: ${session ? 'Valid ✅' : 'None ❌'}`);
  
  // Protect role selection page
  if (req.nextUrl.pathname.startsWith('/onboarding') && !session) {
    console.log('🚫 Redirecting to sign in');
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
  
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};