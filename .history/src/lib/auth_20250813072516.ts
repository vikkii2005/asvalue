import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { db } from '@/lib/supabase'
import type { User } from '@/types/auth'

// Extend NextAuth types to include our custom properties
declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    } & User
  }

  interface User {
    id: string
  }

  interface Profile {
    picture?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    userId?: string
    user?: User
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile',
        },
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google' && user.email) {
          // Check if user already exists in Supabase
          const existingUser = await db.sellers.getByEmail(user.email)

          if (!existingUser) {
            // Create new seller in Supabase
            const newSeller = await db.sellers.create({
              email: user.email,
              name: user.name || profile?.name || null,
              avatar_url:
                user.image ||
                (profile as { picture?: string })?.picture ||
                null,
              is_active: true,
              phone: null,
              category: null,
              business_name: null,
              stripe_customer_id: null,
            })

            // Update user object with Supabase ID
            user.id = newSeller.id
          } else {
            // Update existing user with latest info from Google
            const updatedSeller = await db.sellers.update(existingUser.id, {
              name: user.name || profile?.name || existingUser.name,
              avatar_url:
                user.image ||
                (profile as { picture?: string })?.picture ||
                existingUser.avatar_url,
            })

            // Update user object with Supabase ID
            user.id = updatedSeller.id
          }

          return true
        }

        return false
      } catch (error) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('SignIn callback error:', error)
        }
        return false
      }
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token
        token.userId = user.id
        token.email = user.email
      }

      // Fetch fresh user data from Supabase on each token refresh
      if (token.email) {
        try {
          const supabaseUser = await db.sellers.getByEmail(
            token.email as string
          )
          if (supabaseUser) {
            token.user = supabaseUser
            token.userId = supabaseUser.id
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('JWT callback error fetching user:', error)
          }
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.accessToken = token.accessToken as string
        session.user.id = token.userId as string

        // Add full user data from Supabase to session
        if (token.user) {
          session.user = {
            ...session.user,
            ...(token.user as User),
          }
        }
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url

      // Default redirect to dashboard after successful sign-in
      return `${baseUrl}/dashboard`
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('User signed in:', {
          userId: user.id,
          email: user.email,
          provider: account?.provider,
          isNewUser,
        })
      }

      // Track sign-in analytics (optional)
      if (isNewUser && process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('New user registered:', user.email)
        // Here you could send welcome email, track conversion, etc.
      }
    },

    async signOut({ token }) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('User signed out:', token?.email)
      }
    },

    async createUser({ user }) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('New user created in database:', user.email)
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
}

// Helper functions for authentication
export const getServerSession = async () => {
  const { getServerSession: getNextServerSession } = await import(
    'next-auth/next'
  )
  return getNextServerSession(authOptions)
}

export const requireAuth = async () => {
  const session = await getServerSession()

  if (!session?.user) {
    throw new Error('Authentication required')
  }

  return session
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return null
    }

    // Fetch fresh user data from Supabase
    const user = await db.sellers.getByEmail(session.user.email)
    return user
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error getting current user:', error)
    }
    return null
  }
}

export const getUserSession = async () => {
  const session = await getServerSession()
  return session
}

// Client-side auth helpers
export const isProfileComplete = (user: User): boolean => {
  return !!(user.name && user.business_name && user.category && user.phone)
}

export const getProfileCompletionPercentage = (user: User): number => {
  const fields = [
    user.name,
    user.business_name,
    user.category,
    user.phone,
    user.avatar_url,
  ]

  const completedFields = fields.filter(
    field => field && field.trim() !== ''
  ).length
  return Math.round((completedFields / fields.length) * 100)
}

export const formatUserDisplayName = (user: User): string => {
  if (user.business_name) {
    return user.business_name
  }

  if (user.name) {
    return user.name
  }

  return user.email
}

// Auth error messages
export const AUTH_ERRORS = {
  SIGNIN_FAILED: 'Failed to sign in. Please try again.',
  ACCOUNT_NOT_LINKED: 'Account not linked to any provider.',
  CALLBACK_ERROR: 'Authentication callback error.',
  SESSION_REQUIRED: 'Please sign in to access this page.',
  PROFILE_INCOMPLETE: 'Please complete your profile to continue.',
  EMAIL_REQUIRED: 'Email address is required.',
  GOOGLE_ERROR: 'Google authentication failed.',
} as const

export type AuthErrorType = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS]
