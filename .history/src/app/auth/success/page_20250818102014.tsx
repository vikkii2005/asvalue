// src/app/auth/success/page.tsx
// Success page after authentication

'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/config';

// Define proper User interface (fixes ESLint warning)
interface User {
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  email?: string;
}

export default function SuccessPage() {
  const [user, setUser] = useState<User | null>(null);  // ✅ Fixed!
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ 
          color: '#1f2937', 
          margin: '0 0 20px 0',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          🎉 Welcome to AsValue!
        </h1>
        
        {user && (
          <div style={{ marginBottom: '30px' }}>
            <img 
              src={user.user_metadata?.avatar_url || '/default-avatar.png'} 
              alt="Profile"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                margin: '0 0 15px 0'
              }}
            />
            <h2 style={{ 
              color: '#374151', 
              margin: '0 0 5px 0',
              fontSize: '24px'
            }}>
              Hello, {user.user_metadata?.full_name || user.email}!
            </h2>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {user.email}
            </p>
          </div>
        )}
        
        <div style={{ 
          background: '#f9fafb', 
          borderRadius: '8px', 
          padding: '20px',
          margin: '20px 0'
        }}>
          <p style={{ 
            color: '#374151', 
            margin: 0, 
            fontSize: '16px'
          }}>
            ✅ Successfully authenticated with Google<br/>
            🔐 Your session is secure<br/>
            🚀 Ready to tart selling!
          </p>
        </div>
        
        <button 
          onClick={() => window.location.href = '/dashboard'}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}