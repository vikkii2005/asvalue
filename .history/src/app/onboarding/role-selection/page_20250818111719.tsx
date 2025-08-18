// src/app/onboarding/role-selection/page.tsx
// FIXED - Proper cookie reading with debug logs

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<'seller' | 'buyer' | null```ull);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(() => {
    try {
      console.log('🔍 Checking authentication...');
      console.log('🍪 All cookies:', document.cookie);

      // Parse all cookies into an object
      const cookies = document.cookie
        .split('; ')
        .reduce((acc, curr) => {
          const [key, value] = curr.split('=');
          if (key && value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

      console.log('📝 Parsed cookies:', cookies);

      const sessionCookie = cookies['asvalue-authenticated'];
      console.log('🔑 Session cookie found:', !!sessionCookie);

      if (!sessionCookie) {
        console.log('❌ No asvalue-authenticated cookie found');
        setAuthLoading(false);
        router.push('/auth/signin');
        return;
      }

      try {
        const sessionData = JSON.parse(atob(sessionCookie));
        console.log('✅ Valid session data:', sessionData);

        const authenticatedUser: User = {
          id: sessionData.userId || ```mp-user',
          email: sessionData.email,
          user_metadata: {
            full_name: sessionData.fullName,
            avatar_url: sessionData.avatarUrl,
          },
        };

        setUser(authenticatedUser);
        setAuthLoading(false);
        console.log('✅ User set successfully:', authenticatedUser.```il);

      } catch (parseError) {
        console.error('❌ Failed to parse session cookie:', parseError);
        setAuthLoading(false);
        router.push('/auth/signin');
      }

    } catch (error) {
      console.error('🚫 Auth check error:', error);
      setAuthLoading(false);
      router.push('/auth/signin');
    }
  }, [router]);

  useEffect(() => {
    // Add a small delay to ensure cookie is set
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, [checkAuth]);

  const handleRoleSelect = async (role: 'seller' | 'buyer') => {
    if (!user) return;

    setIsLoading(true);
    setSelectedRole(role);

    console.log(`🎯 Role selected: ${role}`);

    try {
      // Simulate API call (replace with actual API call later)
      setTimeout(() => {
        if (role === 'seller') {
          router.push('/onboarding/seller-setup');
        } else {
          router.push('/marketplace');
        }
      }, 500);

    } catch (error) {
      console.error('Role selection failed:', error);
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
          <p className="text-sm text-gray-400 mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to continue.</p>
          <button
            type="button"
            onClick={() => {
              // Clear any bad cookies before```directing
              document.cookie = 'asvalue-authenticated=; Path=/; Expires=Thu, ```Jan 1970 00:00:01 GMT;';
              router.push('/auth/signin');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to AsValue! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Hi {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')}! Choose your role:
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          
          {/* SELLER CARD */}
          <div 
            onClick={() => !isLoading && handleRoleSelect('seller')}
            className={`
              bg-white rounded-xl p-8 border-2 cursor-pointer transition-all duration-200
              hover:shadow-lg hover:scale-105 hover:border-blue-500
              ${selectedRole === 'seller' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                I&apos;M A SELLER
              </h3>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items```nter">
                  <span className="text-green-500 mr-2">✅</span>
                  Create and manage products```              </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Set your own prices
                </li>
                <li className="flex```ems-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Keep 100% of revenue
                </li>
                <li className="flex items```nter">
                  <span className="text-green-500 mr-2">✅</span>
                  No commission fees ever```              </li>
              </ul>
              <div className="text-sm text-blue-600 font-medium">
                🚀 Be among the first sellers!```            </div>
            </div>
          </div>

          {/* BUYER CARD */}
          <div 
            onClick={() => !isLoading && handleRoleSelect('buyer')}
            className={`
              bg-white rounded-xl p-8 border-2 cursor-pointer transition-all duration-200
              hover:shadow-lg hover:scale-105 hover:border-purple-500
              ${selectedRole === 'buyer' ? 'border```rple-500 bg-purple-50' : 'border-gray-200'}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                I&apos;M A BUYER
              </h3>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Browse amazing products
                </li>
                <li className="flex items```nter">
                  <span className="text-green-500 mr-2">✅</span>
                  Direct contact with sellers```              </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  No hidden fees
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Support local businesses
                </li>
              </ul>
              <div className="text-sm text-purple-600 font-medium">
                🛍️ Discover amazing products!```            </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center mt-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Setting up your account...</p>
          </div>
        )}

        {/* Help Text */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Don&apos;t worry! You can always change your```le later in settings.
        </div>
      </div>
    </div>
  );
}