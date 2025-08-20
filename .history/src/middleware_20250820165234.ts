import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('asvalue-authenticated')
    const hasValidSession = !!sessionCookie?.value

    const isProtectedRoute = 
      request.nextUrl.pathname.startsWith('/onboarding') ||
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/profile')

    console.log(`🔐 ${request.nextUrl.pathname} | Session: ${hasValidSession ? '✅' : '❌'}`)

    if (isProtectedRoute && !hasValidSession) {
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)',],
}