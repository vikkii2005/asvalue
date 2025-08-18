// src/components/auth/auth-loading.tsx
// Loading states during auth

'use client';

import { useEffect, useState } from 'react';

interface AuthLoadingProps {
  stage?: 'initializing' | 'redirecting' | 'processing' | 'completing';
  message?: string;
  showProgress?: boolean;
  timeout?: number;
  onTimeout?: () => void;
}

export default function AuthLoading({
  stage = 'initializing',
  message,
  showProgress = true,
  timeout = 30000, // 30 seconds
  onTimeout
}: AuthLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(stage);
  const [elapsedTime, setElapsedTime] = useState(0);

  const stageConfig = {
    initializing: {
      icon: '🔐',
      title: 'Initializing Secure Connection',
      description: 'Setting up encrypted authentication...',
      expectedDuration: 2000
    },
    redirecting: {
      icon: '🔄',
      title: 'Connecting to Google',
      description: 'Redirecting to Google\'s secure servers...',
      expectedDuration: 3000
    },
    processing: {
      icon: '⚡',
      title: 'Processing Authentication',
      description: 'Validating credentials and creating session...',
      expectedDuration: 5000
    },
    completing: {
      icon: '✅',
      title: 'Almost Ready',
      description: 'Finalizing your secure login...',
      expectedDuration: 2000
    }
  };

  const config = stageConfig[currentStage];

  // Progress simulation based on stage
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);
      
      if (showProgress) {
        const progressPercent = Math.min((elapsed / config.expectedDuration) * 100, 95);
        setProgress(progressPercent);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentStage, config.expectedDuration, showProgress]);

  // Timeout handling
  useEffect(() => {
    if (timeout > 0) {
      const timer = setTimeout(() => {
        console.log('⏰ Auth loading timeout reached');
        if (onTimeout) {
          onTimeout();
        }
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [timeout, onTimeout]);

  // Auto-advance stages for demo purposes
  useEffect(() => {
    if (stage === 'initializing' && elapsedTime > 2000) {
      setCurrentStage('redirecting');
    } else if (stage === 'redirecting' && elapsedTime > 5000) {
      setCurrentStage('processing');
    } else if (stage === 'processing' && elapsedTime > 10000) {
      setCurrentStage('completing');
    }
  }, [stage, elapsedTime]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Main Loading Icon */}
      <div style={{
        fontSize: '64px',
        marginBottom: '24px',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        {config.icon}
      </div>

      {/* Title */}
      <h2 style={{
        color: '#1f2937',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '0 0 12px 0',
        textAlign: 'center'
      }}>
        {config.title}
      </h2>

      {/* Description */}
      <p style={{
        color: '#6b7280',
        fontSize: '16px',
        margin: '0 0 32px 0',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        {message || config.description}
      </p>

      {/* Progress Bar */}
      {showProgress && (
        <div style={{
          width: '100%',
          maxWidth: '300px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#3b82f6',
              borderRadius: '4px',
              transition: 'width 0.3s ease',
              background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s ease-in-out infinite'
            }} />
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            <span>{Math.round(progress)}%</span>
            <span>{Math.round(elapsedTime / 1000)}s</span>
          </div>
        </div>
      )}

      {/* Stage Indicators */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {Object.keys(stageConfig).map((stageKey, index) => {
          const isActive = stageKey === currentStage;
          const isCompleted = Object.keys(stageConfig).indexOf(currentStage) > index;
          
          return (
            <div
              key={stageKey}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: isCompleted ? '#10b981' : isActive ? '#3b82f6' : '#d1d5db',
                transition: 'background-color 0.3s ease'
              }}
            />
          );
        })}
      </div>

      {/* Security Indicators */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        maxWidth: '400px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#059669'
        }}>
          <span>🔒</span>
          <span>SSL Encrypted</span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#059669'
        }}>
          <span>🛡️</span>
          <span>CSRF Protected</span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#059669'
        }}>
          <span>⚡</span>
          <span>PKCE Secured</span>
        </div>
      </div>

      {/* Timeout Warning */}
      {elapsedTime > timeout * 0.8 && (
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          backgroundColor: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#92400e',
          textAlign: 'center'
        }}>
          ⏰ Taking longer than expected? Try refreshing the page.
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}