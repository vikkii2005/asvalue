import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabase } from '@/lib/supabase'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if seller already exists
          const { data: existingSeller } = await supabase
            .from('sellers')
            .select('id, email, auth_user_id')
            .eq('email', user.email)
            .single()

          if (!existingSeller) {
            // Create new seller record
            const { error: insertError } = await supabase
              .from('sellers')
              .insert({
                email: user.email,
                name: user.name || '',
                auth_user_id: user.id,
                is_active: true,
                email_verified: true,
              })

            if (insertError) {
              console.error('Error creating seller:', insertError)
              return false
            }
          } else if (!existingSeller.auth_user_id) {
            // Update existing seller with auth_user_id
            const { error: updateError } = await supabase
              .from('sellers')
              .update({ 
                auth_user_id: user.id,
                email_verified: true,
                updated_at: new Date().toISOString()
              })
              .eq('email', user.email)

            if (updateError) {
              console.error('Error updating seller:', updateError)
              return false
            }
          }
          return true
        } catch (error) {
          console.error('SignIn callback error:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
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
        } catch (error) {
          console.error('Session callback error:', error)
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Store additional user info in JWT token
      if (account && user) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }