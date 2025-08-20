import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('🎯 OAuth callback started')
  console.log('📊 Code received:', code ? 'YES' : 'NO')

  if (code) {
    // 🔥 FIX: Make cookies function async to match expected type
    const supabase = createServerComponentClient({
      cookies: async () => await cookies(),
    })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Auth error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
      }

      console.log('✅ Auth successful for user:', data.user?.email)

      // Check if user has completed seller setup
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('setup_completed')
          .eq('id', data.user.id)
          .single()

        if (profile?.setup_completed) {
          console.log('🎯 Profile completed, redirecting to success')
          return NextResponse.redirect(
            `${requestUrl.origin}/onboarding/success`
          )
        } else {
          console.log('📝 Profile incomplete, redirecting to seller setup')
          return NextResponse.redirect(
            `${requestUrl.origin}/onboarding/seller-setup`
          )
        }
      }

      // Default redirect
      return NextResponse.redirect(
        `${requestUrl.origin}/onboarding/seller-setup`
      )
    } catch (error) {
      console.error('❌ Callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
    }
  }

  console.log('❌ No code parameter')
  return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
}
