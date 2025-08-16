'use client';

import FirebaseAuthProvider from './auth/FirebaseAuthProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAuthProvider>
      {children}
    </FirebaseAuthProvider>
  );
}