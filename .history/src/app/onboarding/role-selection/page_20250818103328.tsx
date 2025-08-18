// src/app/onboarding/role-selection/page.tsx
// FIXED - Complete replacement with modern Supabase client

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUserWithFallback } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<'seller' | 'buyer' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      console.log('🔍 Checking authentication...');
      const currentUser = await getUserWithFallback();

      if (currentUser) {
        console.log('✅ User authenticated:', currentUser.email);
        setUser(currentUser);
        setAuthLoading(false);
        return;
      }

      console.log('❌ No authenticated user found');
      setAuthLoading(false);
      router.push('/auth/signin');
    } catch (error) {
      console.error('🚫 Auth check failed:', error);
      setAuthLoading(false);
      router.push('/auth/signin');
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleRoleSelect = async (role: 'seller' | 'buyer') => {
    if (!user) return;

    setIsLoading(true);
    setSelectedRole(role);

    try {
      console.log(`🎯 Selecting role: ${role}`);

      // Update user role in database using Supabase client
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: role,
          role_selected_at: new Date().toISOString() 
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Database error:', error);
        alert('Something went wrong. Please try again!');
        setIsLoading(false);
        return;
      }

      console.log(`🎉 Role selected successfully: ${role}`);

      // Redirect based on role
      if (role === 'seller') {
        console.log('🔄 Redirecting to seller setup...');
        router.push('/onboarding/seller-setup');
      } else {
        console.log('🔄 Redirecting to marketplace...');
        router.push('/marketplace');
      }
    } catch (error) {
      console.error('🚫 Role selection failed:', error);
      alert('Something went wrong. Please try again!');
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
          <h1 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">Unable to verify your authentication.</p>
          <button
            type="button"
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In Again
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
            Hi {user.user_metadata?.full_name?.split(' ')[0] || user.email}! Choose your role to get started:
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
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Create and manage products
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Set your own prices
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Keep 100% of revenue
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  No commission fees ever
                </li>
              </ul>
              <div className="text-sm text-blue-600 font-medium">
                🚀 Be among the first sellers!
              </div>
            </div>
          </div>

          {/* BUYER CARD */}
          <div 
            onClick={() => !isLoading && handleRoleSelect('buyer')}
            className={`
              bg-white rounded-xl p-8 border-2 cursor-pointer transition-all duration-200
              hover:shadow-lg hover:scale-105 hover:border-purple-500
              ${selectedRole === 'buyer' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}
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
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  Direct contact with sellers
                </li>
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
                🛍️ Discover amazing products!
              </div>
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
          Don&apos;t worry! You can always change your role later in settings.
        </div>
      </div>
    </div>
  );
}