// src/components/auth/auth-status.tsx
// Real-time auth status indicator

'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/config'

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

interface AuthStatusProps {
  showAvatar?: boolean
  showName?: boolean
  showEmail?: boolean
  compact?: boolean
  onAuthChange?: (authenticated: boolean, user?: User) => void
}

export default function AuthStatus({
  showAvatar = true,
  showName = true,
  showEmail = false,
  compact = false,
  onAuthChange,
}: AuthStatusProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionStatus, setSessionStatus] = useState<
    'active' | 'expired' | 'none'
  >('none')
  const [lastActivity, setLastActivity] = useState<Date>(new Date())

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user },
          error,
        } = await supabaseClient.auth.getUser()

        if (error) {
          console.log('❌ Auth check error:', error)
          setUser(null)
          setSessionStatus('none')
        } else if (user) {
          setUser(user)
          setSessionStatus('active')
          setLastActivity(new Date())
          console.log('✅ User authenticated:', user.email)
        } else {
          setUser(null)
          setSessionStatus('none')
        }

        if (onAuthChange) {
          onAuthChange(!!user, user || undefined)
        }
      } catch (error) {
        console.error('❌ Auth status check failed:', error)
        setUser(null)
        setSessionStatus('none')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔐 Auth state changed: ${event}`)

      if (session?.user) {
        setUser(session.user)
        setSessionStatus('active')
        setLastActivity(new Date())
      } else {
        setUser(null)
        setSessionStatus('none')
      }

      if (onAuthChange) {
        onAuthChange(!!session?.user, session?.user || undefined)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [onAuthChange])

  // Track user activity for session management
  useEffect(() => {
    const trackActivity = () => {
      if (user) {
        setLastActivity(new Date())
      }
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ]
    events.forEach(event => {
      document.addEventListener(event, trackActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity, true)
      })
    }
  }, [user])

  // Check for session expiry
  useEffect(() => {
    if (!user) return

    const checkSessionExpiry = () => {
      const now = new Date()
      const timeSinceActivity = now.getTime() - lastActivity.getTime()

      // Consider session stale after 30 minutes of inactivity
      if (timeSinceActivity > 30 * 60 * 1000) {
        setSessionStatus('expired')
      }
    }

    const interval = setInterval(checkSessionExpiry, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [user, lastActivity])

  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut()
      setUser(null)
      setSessionStatus('none')
      console.log('✅ User signed out')
    } catch (error) {
      console.error('❌ Sign out error:', error)
    }
  }

  const handleRefreshSession = async () => {
    try {
      const { data, error } = await supabaseClient.auth.refreshSession()
      if (error) {
        console.error('❌ Session refresh error:', error)
        setSessionStatus('expired')
      } else if (data.session) {
        setSessionStatus('active')
        setLastActivity(new Date())
        console.log('✅ Session refreshed')
      }
    } catch (error) {
      console.error('❌ Session refresh failed:', error)
      setSessionStatus('expired')
    }
  }

  const getStatusColor = () => {
    switch (sessionStatus) {
      case 'active':
        return '#10b981'
      case 'expired':
        return '#f59e0b'
      case 'none':
        return '#6b7280'
      default:
        return '#6b7280'
    }
  }

  const getStatusText = () => {
    switch (sessionStatus) {
      case 'active':
        return 'Online'
      case 'expired':
        return 'Session Expired'
      case 'none':
        return 'Not Signed In'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: compact ? '4px' : '8px',
          fontSize: compact ? '12px' : '14px',
          color: '#6b7280',
        }}
      >
        <div
          style={{
            width: '12px',
            height: '12px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span>Checking...</span>

        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    )
  }

  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: compact ? '4px' : '8px',
          fontSize: compact ? '12px' : '14px',
          color: '#6b7280',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
          }}
        />
        <span>{getStatusText()}</span>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? '6px' : '12px',
        padding: compact ? '4px' : '8px',
        fontSize: compact ? '12px' : '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Status Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            animation:
              sessionStatus === 'active'
                ? 'pulse 2s ease-in-out infinite'
                : 'none',
          }}
        />
        {!compact && (
          <span
            style={{
              color: getStatusColor(),
              fontSize: '12px',
              fontWeight: 'medium',
            }}
          >
            {getStatusText()}
          </span>
        )}
      </div>

      {/* Avatar */}
      {showAvatar && (
        <img
          src={user.user_metadata?.avatar_url || '/default-avatar.png'}
          alt='User Avatar'
          style={{
            width: compact ? '24px' : '32px',
            height: compact ? '24px' : '32px',
            borderRadius: '50%',
            border: '2px solid #e5e7eb',
          }}
        />
      )}

      {/* User Info */}
      {!compact && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {showName && (
            <div
              style={{
                color: '#374151',
                fontWeight: 'medium',
                fontSize: '14px',
              }}
            >
              {user.user_metadata?.full_name || 'User'}
            </div>
          )}
          {showEmail && (
            <div
              style={{
                color: '#6b7280',
                fontSize: '12px',
              }}
            >
              {user.email}
            </div>
          )}
        </div>
      )}

      {/* Session Actions */}
      {sessionStatus === 'expired' && (
        <button
          onClick={handleRefreshSession}
          style={{
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      )}

      {sessionStatus === 'active' && !compact && (
        <button
          onClick={handleSignOut}
          style={{
            background: 'transparent',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
