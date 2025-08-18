// src/app/onboarding/role-selection/page.tsx
// FIXED - Proper cookie handling for multiple accounts

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
        // 🔧 FIXED: Better cookie reading method
        const sessionCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('asvalue-authenticated='));
        
        if (!sessionCookie) {
          console.log('❌ No session cookie found');
          router.push('/auth/signin');
          return;
        }

        const sessionValue = sessionCookie.split('=')[1];
        const sessionData = JSON.parse(atob(sessionValue));
        
        console.log('✅ Current session data:', sessionData.email);

        // 🔧 FIXED: More reliable user object creation
        const authenticatedUser: User = {
          id: sessionData.userId || `temp_${Date.now()}`,
          email: sessionData.email || 'unknown@email.com',
          user_metadata: {
            full_name: sessionData.fullName || 'User',
            avatar_url: sessionData.avatarUrl || null,
          },
        };

        // Load social proof data
        const socialProof = await getAuthenticSocialProof();

        setUser(authenticatedUser);
        setSocialProofStats(socialProof);
        setAuthLoading(false);

      } catch (error) {
        console.error('❌ Auth/data loading failed:', error);
        // 🔧 FIXED: Clear bad cookies and redirect
        document.cookie = 'asvalue-authenticated=; Path=/; Max-Age=0';
        router.push('/auth/signin');
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  if (authLoading || !user || !socialProofStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your experience...</p>
          <p className="text-sm text-gray-400 mt-2">Preparing your dashboard</p>
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