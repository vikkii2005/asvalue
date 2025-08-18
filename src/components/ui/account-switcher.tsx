// src/components/ui/account-switcher.tsx
// NEW - Give users easy way to switch accounts

'use client'

import { useState } from 'react'

export default function AccountSwitcher() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSwitchAccount = async () => {
    setIsLoading(true)
    
    // Clear session cookie
    document.cookie = 'asvalue-authenticated=; Path=/; Max-Age=0'
    
    // Clear any local storage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
    
    // Small delay for UX
    setTimeout(() => {
      window.location.href = '/auth/signin'
    }, 500)
  }

  return (
    <button
      onClick={handleSwitchAccount}
      disabled={isLoading}
      className='fixed bottom-4 right-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm shadow-lg transition-colors z-50'
    >
      {isLoading ? '🔄 Switching...' : '👥 Switch Account'}
    </button>
  )
}