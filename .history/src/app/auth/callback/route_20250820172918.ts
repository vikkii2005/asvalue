import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // SUPABASE HANDLES EVERYTHING - token exchange, session creation, user creation
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to success page
  return Response.redirect(new URL('/auth/success', request.url))
}