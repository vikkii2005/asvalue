'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/FirebaseAuthProvider';
import { useRouter } from 'next/navigation';
// ... keep all your imports exactly the same

const CATEGORIES = [
  'electronics',
  'clothing', 
  'home-garden',
  'sports',
  'books',
  'toys',
  'beauty',
  'automotive',
  'jewelry',
  'art-crafts',
  'other'
];

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuthContext(); // Changed from useSession
  const router = useRouter();
  
  // ... keep all your state exactly the same
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Updated redirect logic
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/signin');
      return;
    }
    
    // If user already has complete profile, redirect to dashboard
    if (user.isProfileComplete) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const profileData = {
        email: user?.email, // Changed from session?.user?.email
        business_name: businessName.trim(),
        category: category.trim(),
        phone: phone?.trim() || null
      };

      console.log('📤 Sending profile data:', profileData);

      // ... keep all your validation and API call logic exactly the same
      if (!profileData.email) {
        throw new Error('No user email found. Please sign in again.');
      }
      if (!profileData.business_name) {
        throw new Error('Business name is required');
      }
      if (!profileData.category) {
        throw new Error('Category is required');
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      const responseText = await response.text();
      console.log('📥 Response:', response.status, responseText);

      if (!response.ok) {
        const errorData = responseText ? JSON.parse(responseText) : {};
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = JSON.parse(responseText);
      console.log('✅ Success:', result);

      setSuccess('Profile updated successfully!');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('❌ Profile error:', err);
      setError(err instanceof Error ? err.message : 'Profile creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) { // Changed from status === 'loading'
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) { // Changed from !session
    return null;
  }

  return (
    // ... keep your entire JSX exactly the same, just update the user info display
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* ... keep everything exactly the same until user info display */}
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3">
          {user?.photoURL && ( // Changed from session.user?.image
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="h-10 w-10 rounded-full"
            />
          )}
          <div>
            <p className="text-sm font-medium text-blue-900">
              {user?.displayName} {/* Changed from session.user?.name */}
            </p>
            <p className="text-sm text-blue-700">
              {user?.email} {/* Changed from session.user?.email */}
            </p>
          </div>
        </div>
      </div>

      {/* ... keep the rest of your JSX exactly the same */}
    </div>
  );
}