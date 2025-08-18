// src/components/auth/offline-handler.tsx
// Offline support component (FIXED VERSION)

'use client';

import { useEffect, useState, useCallback } from 'react';

interface QueuedActionData {
  [key: string]: unknown; // ✅ FIXED: Replace 'any' with specific type
}

interface QueuedAction {
  id: string;
  type: 'auth_request' | 'state_store' | 'profile_update';
  data: QueuedActionData; // ✅ FIXED: Use typed data instead of 'any'
  timestamp: number;
  retryCount: number;
}

interface OfflineHandlerProps {
  onOnline?: () => void;
  onOffline?: () => void;
  showNotification?: boolean;
  autoRetry?: boolean;
  retryInterval?: number;
}

export default function OfflineHandler({
  onOnline,
  onOffline,
  showNotification = true,
  autoRetry = true,
  retryInterval = 5000
}: OfflineHandlerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);
  const [_lastCheck, setLastCheck] = useState<Date>(new Date()); // ✅ FIXED: Prefixed with _

  // Process individual action
  const processAction = useCallback(async (action: QueuedAction): Promise<void> => {
    switch (action.type) {
      case 'auth_request':
        const response = await fetch('/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        if (!response.ok) throw new Error('Auth request failed');
        break;
        
      case 'state_store':
        const stateResponse = await fetch('/api/auth/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        if (!stateResponse.ok) throw new Error('State store failed');
        break;
        
      case 'profile_update':
        const profileResponse = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        if (!profileResponse.ok) throw new Error('Profile update failed');
        break;
        
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }, []);

  // Process queued actions when back online - ✅ FIXED: Now uses useCallback
  const processQueuedActions = useCallback(async () => {
    if (!isOnline || queuedActions.length === 0) return;

    console.log(`Processing ${queuedActions.length} queued actions`);

    for (const action of queuedActions) {
      try {
        await processAction(action);
        
        setQueuedActions(prev => prev.filter(a => a.id !== action.id));
        
        const stored = JSON.parse(localStorage.getItem('asvalue_offline_queue') || '[]');
        const filtered = stored.filter((a: QueuedAction) => a.id !== action.id);
        localStorage.setItem('asvalue_offline_queue', JSON.stringify(filtered));
        
        console.log(`Processed queued action: ${action.type}`);
      } catch (_error) { // ✅ FIXED: Prefixed with _
        console.error(`Failed to process queued action: ${action.type}`);
        
        action.retryCount++;
        
        if (action.retryCount >= 3) {
          setQueuedActions(prev => prev.filter(a => a.id !== action.id));
          console.log(`Removed failed action after 3 retries: ${action.type}`);
        }
      }
    }
  }, [isOnline, queuedActions, processAction]); // ✅ FIXED: Added dependencies

  // Initialize online status
  useEffect(() => {
    setIsOnline(navigator.onLine);
  }, []);

  // Handle online/offline events - ✅ FIXED: Added processQueuedActions dependency
  useEffect(() => {
    const handleOnline = () => {
      console.log('Connection restored');
      setIsOnline(true);
      setLastCheck(new Date());
      
      if (showNotification) {
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 3000);
      }
      
      if (onOnline) {
        onOnline();
      }

      processQueuedActions();
    };

    const handleOffline = () => {
      console.log('Connection lost');
      setIsOnline(false);
      setLastCheck(new Date());
      
      if (showNotification) {
        setShowBanner(true);
      }
      
      if (onOffline) {
        onOffline();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOnline, onOffline, showNotification, processQueuedActions]); // ✅ FIXED: Added dependency

  // Periodic connectivity check - ✅ FIXED: Added processQueuedActions dependency
  useEffect(() => {
    if (!autoRetry) return;

    const checkConnectivity = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const wasOffline = !isOnline;
        setIsOnline(response.ok);
        setLastCheck(new Date());

        if (wasOffline && response.ok) {
          console.log('Connection restored (periodic check)');
          if (onOnline) onOnline();
          processQueuedActions();
        }
      } catch (_error) { // ✅ FIXED: Prefixed with _
        setIsOnline(false);
        setLastCheck(new Date());
      }
    };

    const interval = setInterval(checkConnectivity, retryInterval);
    return () => clearInterval(interval);
  }, [isOnline, autoRetry, retryInterval, onOnline, processQueuedActions]); // ✅ FIXED: Added dependency

  // Queue action for later processing
  const queueAction = (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    setQueuedActions(prev => [...prev, queuedAction]);
    
    const stored = JSON.parse(localStorage.getItem('asvalue_offline_queue') || '[]');
    stored.push(queuedAction);
    localStorage.setItem('asvalue_offline_queue', JSON.stringify(stored));

    console.log(`Queued offline action: ${action.type}`);
  };

  // Load queued actions from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('asvalue_offline_queue') || '[]');
    setQueuedActions(stored);
  }, []);

  // Expose queue function globally for other components
  useEffect(() => {
    (window as Window & typeof globalThis & { queueOfflineAction?: typeof queueAction }).queueOfflineAction = queueAction; // ✅ FIXED: Proper typing
    return () => {
      delete (window as Window & typeof globalThis & { queueOfflineAction?: typeof queueAction }).queueOfflineAction;
    };
  }, []);

  // Don't render anything if notifications are disabled
  if (!showNotification || !showBanner) {
    return null;
  }

  // Connection status banner
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: isOnline ? '#10b981' : '#ef4444',
      color: 'white',
      padding: '12px 20px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 'medium',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      animation: 'slideDown 0.3s ease-out'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '16px' }}>
          {isOnline ? '📶' : '📵'}
        </span>
        
        <span>
          {isOnline 
            ? 'Connection restored! Syncing data...'
            : 'No internet connection. Some features may be limited.'
          }
        </span>

        {queuedActions.length > 0 && isOnline && (
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            marginLeft: '8px'
          }}>
            {queuedActions.length} queued
          </span>
        )}

        <button
          onClick={() => setShowBanner(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            marginLeft: '12px',
            padding: '4px'
          }}
        >
          ✕
        </button>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}