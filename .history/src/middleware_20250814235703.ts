import { NextRequest, NextResponse } from 'next/server'

export function middleware(_request: NextRequest) {
  // Create response
  const response = NextResponse.next()

  // ✅ SET COOP HEADERS DIRECTLY IN MIDDLEWARE
  response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none')
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none')
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin')

  // Add preconnect headers for Firebase
  response.headers.set(
    'Link', 
    '<https://accounts.google.com>; rel=preconnect, <https://apis.google.com>; rel=preconnect'
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}