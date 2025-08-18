// src/app/onboarding/role-selection/page.tsx
// Enhanced main page with social proof and analytics

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, SocialProofData } from '@/lib/types/user';
import { getAuthenticSocialProof } from '@/lib/api/user';
import RoleSelectionContainer from '@/components/onboarding/role-selection-container';

export default function RoleSelectionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [socialProofStats, setSocialProofStats] = useState<SocialProofData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2)}`);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Check authentication from cookie
        const cookies = document.cookie
          .split('; ')
          .reduce((acc, curr) => {
            const [key, value] = curr.split('=');
            if (key && value) acc[key] = value;
            return acc;
          }, {} as Record<string, string>);

        const sessionCookie = cookies['asvalue-authenticated'];
        
        if (!sessionCookie) {
          router.push('/auth/signin');
          return;
        }

        const sessionData = JSON.parse(atob(sessionCookie));
        const authenticatedUser: User = {
          id: sessionData.userId || `user_${Date.now()}`,
          email: sessionData.email,
          user_metadata: {
            full_name: sessionData.fullName,
            avatar_url: sessionData.avatarUrl,
          },
        };

        // Load social proof data
        const socialProof = await getAuthenticSocialProof();

        setUser(authenticatedUser);
        setSocialProofStats(socialProof);
        setAuthLoading(false);

      } catch (error) {
        console.error('Auth/data loading failed:', error);
        router.push('/auth/signin');
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  if (authLoading || !user || !socialProofStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your experience...</p>
          <p className="text-sm text-gray-400 mt-2">Preparing social proof data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <RoleSelectionContainer 
        user={user}
        socialProofStats={socialProofStats}
        sessionId={sessionId}
      />
    </div>
  );
}