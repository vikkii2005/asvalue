import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      sellerId?: string
      isProfileComplete?: boolean
      isActive?: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    sellerId?: string
    isProfileComplete?: boolean
    isActive?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    sellerId?: string
    isProfileComplete?: boolean
    isActive?: boolean
    accessToken?: string
  }
}