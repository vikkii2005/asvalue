// src/app/auth/success/page.tsx
// Simple success page that redirects to role selection

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Simple redirect to role selection after successful auth
    const timer = setTimeout(() => {
      router.push('/onboarding/role-selection');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to AsValue!
        </h1>
        <p className="text-gray-600">
          Setting up your account...
        </p>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mt-4"></div>
      </div>
    </div>
  );
}