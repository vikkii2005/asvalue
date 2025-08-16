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
      console.log('🔐 SignIn attempt:', { 
        email: user?.email, 
        provider: account?.provider,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
      
      if (account?.provider === 'google' && user.email) {
        try {
          // Test Supabase connection first
          // eslint-disable-next-line no-console
          console.log('🔍 Testing Supabase connection...');
          
          const { error: connectionError } = await supabaseAdmin
            .from('sellers')
            .select('count')
            .limit(1);
          
          if (connectionError) {
            // eslint-disable-next-line no-console
            console.error('❌ Supabase connection failed:', {
              error: connectionError.message,
              code: connectionError.code,
              details: connectionError.details
            });
            return false;
          }

          // eslint-disable-next-line no-console
          console.log('✅ Supabase connected successfully');

          // Check if seller exists
          // eslint-disable-next-line no-console
          console.log('🔍 Checking if seller exists for:', user.email);
          
          const { data: existingSeller, error: selectError } = await supabaseAdmin
            .from('sellers')
            .select('id, email, auth_user_id')
            .eq('email', user.email)
            .single();

          if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
            // eslint-disable-next-line no-console
            console.error('❌ Database query error:', {
              error: selectError.message,
              code: selectError.code,
              email: user.email
            });
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
              console.error('❌ Insert error:', {
                error: insertError.message,
                code: insertError.code,
                details: insertError.details
              });
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
              console.error('❌ Update error:', {
                error: updateError.message,
                code: updateError.code,
                details: updateError.details
              });
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
          console.error('❌ Unexpected error in signIn callback:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            email: user.email
          });
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
      // Enhanced redirect logic
      // eslint-disable-next-line no-console
      console.log('🔀 Redirect callback:', { url, baseUrl });
      
      // If it's a relative URL, make it absolute
      if (url.startsWith('/')) return `${baseUrl}${url}`
      
      // If it's the same origin, allow it
      if (new URL(url).origin === baseUrl) return url
      
      // Default redirect to profile setup
      return `${baseUrl}/profile`
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