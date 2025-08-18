// src/app/onboarding/role-selection/page.tsx
// FIXED - Works with new simple session system

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
      
      // Check for our simple authentication cookie
      const authCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('asvalue-authenticated='));
      
      if (authCookie) {
        try {
          const cookieValue = authCookie.split('=')[1];
          const sessionData = JSON.parse(atob(cookieValue));
          
          if (sessionData.authenticated) {
            console.log('✅ User authenticated via cookie:', sessionData.email);
            
            const authenticatedUser: User = {
              id: sessionData.userId,
              email: sessionData.email,
              user_metadata: {
                full_name: sessionData.fullName
              }
            };
            
            setUser(authenticatedUser);
            setAuthLoading(false);
            return;
          }
        } catch (cookieError) {
          console.error('Cookie parsing error:', cookieError);
        }
      }

      // Fallback: Try Supabase session
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (supabaseUser) {
        console.log('✅ Supabase user found:', supabaseUser.email);
        setUser(supabaseUser);
        setAuthLoading(false);
        return;
      }

      // No authentication found
      console.log('❌ No authentication found anywhere');
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
      console.log(`🎯 Selecting role: ${role} for user: ${user.id}`);

      // Update role in database
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
          <h1 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to continue.</p>
          <button
            type="button"
            onClick={() => {
              // Clear any bad cookies
              document.cookie = 'asvalue-authenticated=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to AsValue! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Hi {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')}! Choose your role:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">I&apos;M A SELLER</h3>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>Create and manage products
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>Set your own prices
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>Keep 100% of revenue
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>No commission fees ever
                </li>
              </ul>
              <div className="text-sm text-blue-600 font-medium">🚀 Be among the first sellers!</div>
            </div>
          </div>

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
              <h3 className="text-xl font-bold text-gray-900 mb-4">I&apos;M A BUYER</h3>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>Browse amazing products
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>Direct contact with sellers
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>No hidden fees
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>Support local businesses
                </li>
              </ul>
              <div className="text-sm text-purple-600 font-medium">🛍️ Discover amazing products!</div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center mt-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Setting up your account...</p>
          </div>
        )}

        <div className="text-center mt-8 text-sm text-gray-500">
          Don&apos;t worry! You can always change your role later in settings.
        </div>
      </div>
    </div>
  );
}