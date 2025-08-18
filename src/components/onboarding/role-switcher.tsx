// src/components/onboarding/role-switcher.tsx
// Future role switching with social proof

import React, { useState } from 'react'
import { UserRole, SocialProofData } from '@/lib/types/user'

interface RoleSwitcherProps {
  currentRole: UserRole
  socialProofStats: SocialProofData
  onRoleSwitch: (newRole: UserRole) => Promise<void>
  isOpen: boolean
  onClose: () => void
}

export default function RoleSwitcher({
  currentRole,
  socialProofStats,
  onRoleSwitch,
  isOpen,
  onClose,
}: RoleSwitcherProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const targetRole = currentRole === 'seller' ? 'buyer' : 'seller'
  const targetCount =
    targetRole === 'seller'
      ? socialProofStats.seller_count
      : socialProofStats.buyer_count

  const handleSwitch = async () => {
    setIsLoading(true)
    try {
      await onRoleSwitch(targetRole)
      onClose()
    } catch (error) {
      console.error('Role switch failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
      <div className='w-full max-w-md rounded-xl bg-white p-6'>
        <h3 className='mb-4 text-xl font-bold text-gray-900'>
          Switch to {targetRole.charAt(0).toUpperCase() + targetRole.slice(1)}{' '}
          Role?
        </h3>

        <div className='mb-6'>
          <div className='mb-2 font-medium text-blue-600'>
            👥 Join {targetCount}+ active {targetRole}s
          </div>
          <div className='text-sm text-gray-600'>
            This will change your experience to {targetRole} mode with{' '}
            {targetRole === 'seller'
              ? 'product management'
              : 'marketplace browsing'}
            .
          </div>
        </div>

        <div className='flex space-x-3'>
          <button
            onClick={handleSwitch}
            disabled={isLoading}
            className='flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50'
          >
            {isLoading ? 'Switching...' : 'Confirm Switch'}
          </button>
          <button
            onClick={onClose}
            className='flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
