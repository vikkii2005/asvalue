import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // Add redirect callback for automatic dashboard redirect
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign-in
      if (url === baseUrl) {
        return `${baseUrl}/dashboard`
      }
      // Allow callback URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url
      }
      return `${baseUrl}/dashboard`
    },

    async signIn({ user, account, profile: _profile }) {
      try {
        if (account?.provider === 'google' && user.email) {
          // Check if user exists in our sellers table
          const { data: existingUser } = await supabase
            .from('sellers')
            .select('*')
            .eq('email', user.email)
            .single()

          if (!existingUser) {
            // Create new seller in our database with generated UUID
            const { error } = await supabase
              .from('sellers')
              .insert([
                {
                  // Let Supabase generate the UUID automatically
                  email: user.email,
                  name: user.name || '',
                  avatar_url: user.image || null,
                  is_active: true,
                }
              ])

            if (error) {
              // Log error only in development
              if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.error('Error creating user:', error)
              }
              return false
            }
          }
        }
        return true
      } catch (error) {
        // Log error only in development  
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('SignIn callback error:', error)
        }
        return false
      }
    },

    async jwt({ token, user }) {
      // Only run this logic when user is present (initial sign-in)
      if (user && user.email) {
        // Get the actual user ID from database using email
        const { data: dbUser } = await supabase
          .from('sellers')
          .select('id, email')
          .eq('email', user.email)
          .single()
        
        if (dbUser) {
          token.id = dbUser.id
          token.email = dbUser.email
        }
      }
      return token
    },

    async session({ session, token }) {
      // Add database user ID to session
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
}