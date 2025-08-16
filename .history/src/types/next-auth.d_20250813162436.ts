import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      sellerId?: string
      isProfileComplete?: boolean
      isActive?: boolean
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    sellerId?: string
    isProfileComplete?: boolean
    isActive?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sellerId?: string
    isProfileComplete?: boolean
    isActive?: boolean
    accessToken?: string
  }
}
