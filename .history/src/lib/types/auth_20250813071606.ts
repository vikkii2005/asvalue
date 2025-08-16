export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  category: string | null
  avatar_url: string | null
  business_name: string | null
  is_active: boolean
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface Session {
  user: User
  expires: string
}

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpData {
  email: string
  name: string
  business_name?: string
  category?: string
  phone?: string
}

export interface AuthError {
  message: string
  code?: string
  field?: string
}

export interface GoogleAuthProvider {
  id: 'google'
  name: 'Google'
  type: 'oauth'
}

export interface AuthCallbacks {
  onSignIn?: (user: User) => void
  onSignOut?: () => void
  onError?: (error: AuthError) => void
}
