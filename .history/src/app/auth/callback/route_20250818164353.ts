// src/app/auth/callback/route.ts - FIXED UUID VERSION
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Exchange code for session - this creates REAL UUID
      await supabase.auth.exchangeCodeForSession(code);
      
      // Get the real user with proper UUID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Create/update profile with REAL UUID
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id, // ✅ This is the REAL UUID!
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            avatar_url: user.user_metadata?.avatar_url,
            updated_at: new Date().toISOString()
          });
          
        if (error) console.error('Profile upsert error:', error);
      }
    }
    
    return NextResponse.redirect(`${requestUrl.origin}/auth/success`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${requestUrl.origin}/auth/error`);
  }
}