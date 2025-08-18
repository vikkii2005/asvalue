// src/app/auth/offline/page.tsx
// Offline state handling

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())
  const router = useRouter()

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('📶 Connection restored')
      setIsOnline(true)
      setLastChecked(new Date())

      // Auto-redirect when back online
      setTimeout(() => {
        router.push('/auth/signin')
      }, 2000)
    }

    const handleOffline = () => {
      console.log('📵 Connection lost')
      setIsOnline(false)
      setLastChecked(new Date())
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic connectivity check
    const checkConnectivity = async () => {
      try {
        const response = await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache',
        })

        if (response.ok) {
          if (!isOnline) {
            setIsOnline(true)
            setLastChecked(new Date())
          }
        } else {
          setIsOnline(false)
        }
      } catch {
        setIsOnline(false)
      }
      setLastChecked(new Date())
    }

    // Check every 5 seconds when offline
    const interval = setInterval(checkConnectivity, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [isOnline, router])

  const handleRetry = async () => {
    setRetryAttempts(prev => prev + 1)
    console.log(`🔄 Manual retry attempt #${retryAttempts + 1}`)

    try {
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
      })

      if (response.ok) {
        setIsOnline(true)
        router.push('/auth/signin')
      } else {
        setIsOnline(false)
      }
    } catch {
      setIsOnline(false)
    }
    setLastChecked(new Date())
  }

  const handleGoOffline = () => {
    // Store offline state for later retry
    localStorage.setItem(
      'asvalue_offline_auth',
      JSON.stringify({
        timestamp: Date.now(),
        retryUrl: '/auth/signin',
        attempts: retryAttempts,
      })
    )

    router.push('/')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        {/* Status Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            background: isOnline ? '#dcfce7' : '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '40px',
          }}
        >
          {isOnline ? '📶' : '📵'}
        </div>

        {/* Title */}
        <h1
          style={{
            color: '#1f2937',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 15px 0',
          }}
        >
          {isOnline ? 'Connection Restored!' : 'No Internet Connection'}
        </h1>

        {/* Status Message */}
        <p
          style={{
            color: '#6b7280',
            fontSize: '18px',
            margin: '0 0 30px 0',
            lineHeight: '1.5',
          }}
        >
          {isOnline
            ? 'Your internet connection has been restored. Redirecting you back to sign-in...'
            : 'Please check your internet connection and try again. Authentication requires an active internet connection.'}
        </p>

        {/* Connection Info */}
        <div
          style={{
            background: '#f9fafb',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px',
            textAlign: 'left',
          }}
        >
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#374151', fontSize: '14px' }}>
              Connection Status:
            </strong>
            <span
              style={{
                color: isOnline ? '#059669' : '#dc2626',
                fontSize: '14px',
                marginLeft: '10px',
                fontWeight: 'bold',
              }}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#374151', fontSize: '14px' }}>
              Last Checked:
            </strong>
            <span
              style={{ color: '#6b7280', fontSize: '14px', marginLeft: '10px' }}
            >
              {lastChecked.toLocaleTimeString()}
            </span>
          </div>

          {retryAttempts > 0 && (
            <div>
              <strong style={{ color: '#374151', fontSize: '14px' }}>
                Retry Attempts:
              </strong>
              <span
                style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  marginLeft: '10px',
                }}
              >
                {retryAttempts}
              </span>
            </div>
          )}
        </div>

        {/* Tips */}
        {!isOnline && (
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px',
              textAlign: 'left',
            }}
          >
            <h3
              style={{
                color: '#92400e',
                fontSize: '16px',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
              }}
            >
              💡 Connection Tips:
            </h3>
            <ul
              style={{
                color: '#92400e',
                fontSize: '14px',
                margin: 0,
                paddingLeft: '20px',
              }}
            >
              <li style={{ marginBottom: '5px' }}>
                Check your WiFi or mobile data
              </li>
              <li style={{ marginBottom: '5px' }}>
                Try switching between WiFi and mobile data
              </li>
              <li style={{ marginBottom: '5px' }}>
                Move closer to your WiFi router
              </li>
              <li style={{ marginBottom: '5px' }}>
                Restart your router if needed
              </li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}
        >
          {!isOnline && (
            <button
              onClick={handleRetry}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#2563eb'
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#3b82f6'
              }}
            >
              🔄 Check Connection Again
            </button>
          )}

          <button
            onClick={handleGoOffline}
            style={{
              background: 'transparent',
              color: '#6b7280',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'medium',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = '#9ca3af'
              e.currentTarget.style.color = '#374151'
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.color = '#6b7280'
            }}
          >
            Browse Offline
          </button>
        </div>

        {/* Auto-retry indicator */}
        {!isOnline && (
          <div
            style={{
              marginTop: '20px',
              padding: '10px',
              background: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd',
            }}
          >
            <p
              style={{
                color: '#0369a1',
                fontSize: '12px',
                margin: 0,
              }}
            >
              🔄 Automatically checking connection every 5 seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
