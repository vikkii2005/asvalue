// src/app/auth/callback/route.ts - NEXT.JS 15 FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  try {
    const code = requestUrl.searchParams.get('code');
    
    if (code) {
      // ✅ FIXED: Await cookies for Next.js 15
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient({ 
        cookies: () => cookieStore 
      });
      
      // Exchange code for session - this creates REAL UUID
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
      }
      
      // Get the real user with proper UUID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User fetch error:', userError);
        return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
      }
      
      // Create/update profile with REAL UUID
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // ✅ This is the REAL UUID!
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email || 'User',
          avatar_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString()
        });
        
      if (profileError) {
        console.error('Profile upsert error:', profileError);
        // Don't fail the auth, just log the error
      }
      
      console.log('✅ User authenticated with UUID:', user.id);
    }
    
    return NextResponse.redirect(`${requestUrl.origin}/auth/success`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
  }
}