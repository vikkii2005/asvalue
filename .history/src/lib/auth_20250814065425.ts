import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabase } from '@/lib/supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/(auth)/signin',
    error: '/auth/error', // ✅ ADD THIS LINE
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log('🔐 SignIn attempt:', { email: user?.email, provider: account?.provider });
      
      if (account?.provider === 'google' && user.email) {
        try {
          // Test Supabase connection
          const { error: connectionError } = await supabase
            .from('sellers')
            .select('count')
            .limit(1);
          
          if (connectionError) {
            console.error('❌ Supabase connection failed:', connectionError);
            return false; // This will trigger AccessDenied
          }

          // Check if seller exists
          const { data: existingSeller, error: selectError } = await supabase
            .from('sellers')
            .select('id, email, auth_user_id')
            .eq('email', user.email)
            .single();

          if (selectError && selectError.code !== 'PGRST116') {
            console.error('❌ Database query error:', selectError);
            return false;
          }

          if (!existingSeller) {
            // Create new seller
            const { error: insertError } = await supabase
              .from('sellers')
              .insert({
                email: user.email,
                name: user.name || '',
                auth_user_id: user.id,
                is_active: true,
                email_verified: true,
              });

            if (insertError) {
              console.error('❌ Insert error:', insertError);
              return false;
            }
            console.log('✅ New seller created');
          }

          return true;
        } catch (error) {
          console.error('❌ Unexpected error:', error);
          return false;
        }
      }
      
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          const { data: seller } = await supabase
            .from('sellers')
            .select('id, business_name, category, phone, is_active')
            .eq('email', session.user.email)
            .single()

          if (seller) {
            session.user.sellerId = seller.id
            session.user.isProfileComplete = Boolean(
              seller.business_name?.trim() &&
                seller.category?.trim() &&
                seller.phone?.trim()
            )
            session.user.isActive = seller.is_active
          }
        } catch {
          // Handle silently
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.userId = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }