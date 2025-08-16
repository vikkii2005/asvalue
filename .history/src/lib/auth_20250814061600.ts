import GoogleProvider from 'next-auth/providers/google'
import { AuthOptions } from 'next-auth'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Optional: Create user in Supabase here
      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirect to profile setup after sign-in
      if (url === baseUrl) return `${baseUrl}/profile`
      return url
    },
    async session({ session, token }) {
      return session
    }
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error'
  }
}