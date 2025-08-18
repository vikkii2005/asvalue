// src/components/onboarding/offline-handler.tsx
// Handle offline role selection with social proof caching

import React, { useState, useEffect, ReactNode } from 'react';
import { SocialProofData } from '@/lib/types/user';

interface OfflineHandlerProps {
  children: ReactNode;
  socialProofStats: SocialProofData;
}

export default function OfflineHandler({ children, socialProofStats }: OfflineHandlerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [queuedActions, setQueuedActions] = useState<any[]>([]);

  useEffect(() => {
    // Cache social proof data
    if (typeof window !== 'undefined') {
      localStorage.setItem('cached-social-proof', JSON.stringify({
        ...socialProofStats,
        cachedAt: Date.now()
      }));
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connection restored - processing queued actions');
      processQueuedActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Gone offline - queueing future actions');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [socialProofStats]);

  const processQueuedActions = async () => {
    for (const action of queuedActions) {
      try {
        await action.execute();
        console.log('Processed queued action:', action.type);
      } catch (error) {
        console.error('Failed to process queued action:', error);
      }
    }
    setQueuedActions([]);
  };

  const queueAction = (action: any) => {
    setQueuedActions(prev => [...prev, action]);
  };

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            You're Offline
          </h1>
          <p className="text-gray-600 mb-6">
            No worries! You can still browse and make your role selection. 
            We'll save your choice when you're back online.
          </p>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">
              Cached data available • {queuedActions.length} actions queued
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}