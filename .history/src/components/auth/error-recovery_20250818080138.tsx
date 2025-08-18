// src/components/auth/error-recovery.tsx
// Smart error handling UI (COMPLETELY FIXED VERSION)

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthError {
  type: 'network' | 'timeout' | 'config' | 'security' | 'server' | 'user_cancelled' | 'unknown';
  message: string;
  code?: string;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorRecoveryProps {
  error: AuthError;
  onRetry?: () => void;
  onCancel?: () => void;
  maxRetries?: number;
  autoRetryDelay?: number;
  showTechnicalDetails?: boolean;
}

export default function ErrorRecovery({
  error,
  onRetry,
  onCancel,
  maxRetries = 3,
  autoRetryDelay = 5000,
  showTechnicalDetails = false
}: ErrorRecoveryProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState(0);
  const [showDetails, setShowDetails] = useState(showTechnicalDetails);
  const router = useRouter();

  // ✅ FIXED: Wrapped handleRetry in useCallback
  const handleRetry = useCallback(() => {
    console.log(`Error recovery retry attempt #${retryCount + 1}`);
    setRetryCount(prev => prev + 1);
    setIsAutoRetrying(false);
    
    if (onRetry) {
      onRetry();
    } else {
      router.push('/auth/signin');
    }
  }, [retryCount, onRetry, router]);

  // ✅ FIXED: Added ALL dependencies to useEffect
  useEffect(() => {
    const shouldAutoRetry = error.retryable && 
                           retryCount < maxRetries && 
                           (error.type === 'network' || error.type === 'timeout');

    if (shouldAutoRetry && autoRetryDelay > 0) {
      setIsAutoRetrying(true);
      setAutoRetryCountdown(Math.ceil(autoRetryDelay / 1000));

      const countdownInterval = setInterval(() => {
        setAutoRetryCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            handleRetry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
        setIsAutoRetrying(false);
      };
    }
  }, [error.retryable, error.type, retryCount, maxRetries, autoRetryDelay, handleRetry]); // ✅ FIXED: All dependencies

  const handleCancel = useCallback(() => {
    console.log('Error recovery cancelled by user');
    if (onCancel) {
      onCancel();
    } else {
      router.push('/');
    }
  }, [onCancel, router]);

  const handleContactSupport = useCallback(() => {
    const supportEmail = 'support@asvalue.com';
    const subject = `Authentication Error: ${error.type.toUpperCase()}`;
    const body = `
Error Details:
- Type: ${error.type}
- Message: ${error.message}
- Code: ${error.code || 'N/A'}
- Retry Count: ${retryCount}
- Timestamp: ${new Date().toISOString()}
- User Agent: ${navigator.userAgent}
- URL: ${window.location.href}

Please describe what you were trying to do when this error occurred:

    `.trim();

    window.open(`mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }, [error, retryCount]);

  const getErrorIcon = useCallback(() => {
    switch (error.severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '❓';
    }
  }, [error.severity]);

  const getErrorColor = useCallback(() => {
    switch (error.severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#2563eb';
      default: return '#6b7280';
    }
  }, [error.severity]);

  const getRecoverySteps = useCallback(() => {
    switch (error.type) {
      case 'network':
        return [
          'Check your internet connection',
          'Try switching between WiFi and mobile data',
          'Disable VPN if active',
          'Restart your router if needed'
        ];
      case 'timeout':
        return [
          'Ensure stable internet connection',
          'Close other bandwidth-heavy applications',
          'Try again with better connection',
          'Clear browser cache and cookies'
        ];
      case 'config':
        return [
          'This is a configuration issue',
          'Please contact support for assistance',
          'Provide error details when contacting support',
          'Try again later as we fix the issue'
        ];
      case 'security':
        return [
          'This is a security protection measure',
          'Clear browser cache and cookies',
          'Start a fresh authentication attempt',
          'Contact support if issue persists'
        ];
      case 'server':
        return [
          'Our servers are experiencing issues',
          'Please try again in a few minutes',
          'Check our status page for updates',
          'Contact support if problem continues'
        ];
      case 'user_cancelled':
        return [
          'You cancelled the sign-in process',
          'Click "Try Again" to restart',
          'Make sure to complete the Google authorization',
          'Contact support if you need assistance'
        ];
      default:
        return [
          'An unexpected error occurred',
          'Try refreshing the page',
          'Clear browser cache if needed',
          'Contact support with error details'
        ];
    }
  }, [error.type]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        border: `2px solid ${getErrorColor()}`,
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Error Icon */}
        <div style={{
          fontSize: '64px',
          marginBottom: '20px'
        }}>
          {getErrorIcon()}
        </div>

        {/* Error Title */}
        <h1 style={{
          color: getErrorColor(),
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0 0 16px 0',
          textTransform: 'capitalize'
        }}>
          {error.type.replace('_', ' ')} Error
        </h1>

        {/* Error Message */}
        <p style={{
          color: '#374151',
          fontSize: '16px',
          margin: '0 0 24px 0',
          lineHeight: '1.5'
        }}>
          {error.message}
        </p>

        {/* Retry Count Display */}
        {retryCount > 0 && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{
              color: '#92400e',
              fontSize: '14px',
              margin: 0
            }}>
              Retry attempt {retryCount} of {maxRetries}
            </p>
          </div>
        )}

        {/* Auto-retry Countdown */}
        {isAutoRetrying && autoRetryCountdown > 0 && (
          <div style={{
            background: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <p style={{
              color: '#1e40af',
              fontSize: '14px',
              margin: '0 0 8px 0',
              fontWeight: 'medium'
            }}>
              Auto-retrying in {autoRetryCountdown} seconds...
            </p>
            <button
              onClick={() => setIsAutoRetrying(false)}
              style={{
                background: 'transparent',
                color: '#1e40af',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'underline'
              }}
            >
              Cancel auto-retry
            </button>
          </div>
        )}

        {/* Recovery Steps */}
        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <h3 style={{
            color: '#374151',
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 0 12px 0'
          }}>
            💡 How to fix this:
          </h3>
          <ol style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0,
            paddingLeft: '20px'
          }}>
            {getRecoverySteps().map((step, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Technical Details (Collapsible) */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'transparent',
              color: '#6b7280',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline',
              marginBottom: '12px'
            }}
          >
            {showDetails ? '▼' : '▶'} Technical Details
          </button>
          
          {showDetails && (
            <div style={{
              background: '#f3f4f6',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '12px',
              color: '#374151',
              fontFamily: 'monospace',
              textAlign: 'left',
              wordBreak: 'break-all'
            }}>
              <div><strong>Type:</strong> {error.type}</div>
              <div><strong>Code:</strong> {error.code || 'N/A'}</div>
              <div><strong>Severity:</strong> {error.severity}</div>
              <div><strong>Retryable:</strong> {error.retryable ? 'Yes' : 'No'}</div>
              <div><strong>Attempts:</strong> {retryCount}</div>
              <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {error.retryable && retryCount < maxRetries && !isAutoRetrying && (
            <button
              onClick={handleRetry}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#2563eb';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#3b82f6';
              }}
            >
              🔄 Try Again
            </button>
          )}

          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={handleContactSupport}
              style={{
                background: 'transparent',
                color: '#6b7280',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'medium',
                cursor: 'pointer',
                flex: 1,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              📧 Contact Support
            </button>

            <button
              onClick={handleCancel}
              style={{
                background: 'transparent',
                color: '#6b7280',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'medium',
                cursor: 'pointer',
                flex: 1,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              🏠 Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}