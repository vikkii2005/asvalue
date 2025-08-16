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
            .select('id, email')
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
              })

            if (insertError) {
              return false
            }
          }
          return true
        } catch (error) {
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
            .select('id, business_name, category, phone')
            .eq('email', session.user.email)
            .single()

          if (seller) {
            session.user.sellerId = seller.id
            session.user.isProfileComplete = Boolean(
              seller.business_name && seller.category && seller.phone
            )
          }
        } catch (error) {
          // Handle error silently
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }