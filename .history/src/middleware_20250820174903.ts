import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const { data: { session } } = await supabase.auth.getSession()

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedPage = request.nextUrl.pathname.startsWith('/onboarding') || 
                           request.nextUrl.pathname.startsWith('/dashboard')

  if (isProtectedPage && !session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  if (isAuthPage && session && !request.nextUrl.pathname.includes('/callback')) {
    return NextResponse.redirect(new URL('/onboarding/seller-setup', request.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}