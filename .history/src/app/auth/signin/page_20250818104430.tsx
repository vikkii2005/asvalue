// src/app/auth/signin/page.tsx
// FIXED - Use Supabase's built-in OAuth (no custom PKCE needed)

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/onboarding/role-selection');
      }
    };
    checkAuth();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting Google OAuth...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.error('❌ OAuth initiation failed:', error);
        alert('Sign in failed. Please try again.');
        setLoading(false);
      }

      // OAuth redirect will happen automatically
      console.log('✅ OAuth initiated successfully');

    } catch (error) {
      console.error('❌ Sign in error:', error);
      alert('Sign in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to AsValue
          </h1>
          <p className="text-gray-600 mb-8">
            Sign in to get started with zero-commission selling
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`
              w-full flex items-center justify-center px-4 py-3 border border-gray-300 
              rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 
              hover:bg-gray-50 transition-colors duration-200
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
            `}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? 'Redirecting to Google...' : 'Continue with Google'}
          </button>

          <p className="mt-4 text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}