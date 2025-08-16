'use client';

import { useAuthContext } from './FirebaseAuthProvider';
import { useState } from 'react';

export default function GoogleSignInButton() {
  // Get the sign-in function from our new Firebase auth system
  const { signInWithGoogle } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      // This now uses Firebase instead of NextAuth
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className='rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 hover:shadow-xl disabled:opacity-50'
    >
      {loading ? 'Signing in...' : 'Join Free Beta'}
    </button>
  );
}