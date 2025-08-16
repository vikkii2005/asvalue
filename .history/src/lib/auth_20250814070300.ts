import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseAdmin } from '@/lib/supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      // eslint-disable-next-line no-console
      console.log('🔐 SignIn attempt:', { email: user?.email, provider: account?.provider });
      
      if (account?.provider === 'google' && user.email) {
        try {
          // Test Supabase connection first
          const { error: connectionError } = await supabaseAdmin
            .from('sellers')
            .select('count')
            .limit(1);
          
          if (connectionError) {
            // eslint-disable-next-line no-console
            console.error('❌ Supabase connection failed:', connectionError);
            return false;
          }

          // eslint-disable-next-line no-console
          console.log('✅ Supabase connected successfully');

          // Check if seller exists
          const { data: existingSeller, error: selectError } = await supabaseAdmin
            .from('sellers')
            .select('id, email, auth_user_id')
            .eq('email', user.email)
            .single();

          if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
            // eslint-disable-next-line no-console
            console.error('❌ Database query error:', selectError);
            return false;
          }

          if (!existingSeller) {
            // Create new seller record
            // eslint-disable-next-line no-console
            console.log('🆕 Creating new seller for:', user.email);
            const { error: insertError } = await supabaseAdmin
              .from('sellers')
              .insert({
                email: user.email,
                name: user.name || '',
                auth_user_id: user.id,
                is_active: true,
                email_verified: true,
              });

            if (insertError) {
              // eslint-disable-next-line no-console
              console.error('❌ Insert error:', insertError);
              return false;
            }
            // eslint-disable-next-line no-console
            console.log('✅ New seller created successfully');
          } else if (!existingSeller.auth_user_id) {
            // Update existing seller with auth_user_id
            // eslint-disable-next-line no-console
            console.log('🔄 Updating existing seller:', user.email);
            const { error: updateError } = await supabaseAdmin
              .from('sellers')
              .update({
                auth_user_id: user.id,
                email_verified: true,
                updated_at: new Date().toISOString(),
              })
              .eq('email', user.email);

            if (updateError) {
              // eslint-disable-next-line no-console
              console.error('❌ Update error:', updateError);
              return false;
            }
            // eslint-disable-next-line no-console
            console.log('✅ Seller updated successfully');
          } else {
            // eslint-disable-next-line no-console
            console.log('✅ Existing seller found, no updates needed');
          }

          return true;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('❌ Unexpected error in signIn callback:', error);
          return false;
        }
      }
      
      // eslint-disable-next-line no-console
      console.log('✅ Non-Google provider or missing email, allowing sign-in');
      return true;
    },

    async session({ session }) {
      if (session.user?.email) {
        try {
          const { data: seller } = await supabaseAdmin
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
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('❌ Session callback error:', error);
          // Handle silently but log the error
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

    async redirect({ url, baseUrl }) {
      // Custom redirect logic
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/profile` // Default redirect to profile setup
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }