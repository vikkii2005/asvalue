// src/components/onboarding/role-selection-container.tsx
// FIXED - Double cast for TypeScript compatibility

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  UserRole,
  SocialProofData,
  RoleSelectionState,
} from '@/lib/types/user'
import { updateUserRole } from '@/lib/api/user'
import {
  trackRolePageLoad,
  trackRoleSelection,
  trackUserHesitation,
} from '@/lib/analytics/role-selection'
import RoleCard from './role-card'
import OnboardingProgress from './onboarding-progress'
import RoleHelp from './role-help'

interface RoleSelectionContainerProps {
  user: User
  socialProofStats: SocialProofData
  sessionId?: string
}

export default function RoleSelectionContainer({
  user,
  socialProofStats,
  sessionId = 'default-session',
}: RoleSelectionContainerProps) {
  const router = useRouter()
  const [state, setState] = useState<RoleSelectionState>({
    selectedRole: null,
    isLoading: false,
    error: null,
    showHelp: false,
    socialProofStats,
    selectionStartTime: new Date(),
    hesitationDetected: false,
  })

  // Track page load - FIXED: Double cast for TypeScript compatibility
  useEffect(() => {
    trackRolePageLoad(
      user.id,
      sessionId,
      socialProofStats as unknown as Record<string, unknown>
    )
  }, [user.id, sessionId, socialProofStats])

  // Detect hesitation (user taking >10 seconds to decide)
  useEffect(() => {
    const hesitationTimer = setTimeout(() => {
      if (!state.selectedRole && !state.hesitationDetected) {
        setState(prev => ({ ...prev, hesitationDetected: true }))
        trackUserHesitation(10000, user.id)
      }
    }, 10000)

    return () => clearTimeout(hesitationTimer)
  }, [state.selectedRole, state.hesitationDetected, user.id])

  const handleRoleSelect = useCallback(
    async (role: UserRole) => {
      if (state.isLoading) return

      const selectionTime = Date.now() - state.selectionStartTime.getTime()

      setState(prev => ({
        ...prev,
        selectedRole: role,
        isLoading: true,
        error: null,
      }))

      try {
        // Track the selection
        trackRoleSelection(
          role,
          selectionTime,
          state.hesitationDetected,
          user.id
        )

        // Update role in database
        const result = await updateUserRole(user.id, role, selectionTime)

        if (!result.success) {
          throw new Error(result.error || 'Failed to update role')
        }

        // Redirect based on role
        setTimeout(() => {
          if (role === 'seller') {
            router.push('/onboarding/seller-setup')
          } else {
            router.push('/marketplace')
          }
        }, 1000)
      } catch (error) {
        console.error('Role selection failed:', error)
        setState(prev => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Something went wrong',
        }))

        // Auto-clear error after 5 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, error: null }))
        }, 5000)
      }
    },
    [
      state.isLoading,
      state.selectionStartTime,
      state.hesitationDetected,
      user.id,
      router,
    ]
  )

  const userName =
    user.user_metadata?.full_name?.split(' ')[0] ||
    user.email?.split('@') ||
    'there'

  return (
    <div className='mx-auto max-w-4xl'>
      {/* Progress Indicator */}
      <OnboardingProgress currentStep={1} />

      {/* Welcome Message */}
      <div className='mb-8 text-center'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>
          Welcome to AsValue! 👋
        </h1>
        <p className='text-lg text-gray-600'>
          Hi {userName}! Choose your role to get started:
        </p>
        {state.hesitationDetected && (
          <p className='mt-2 text-sm text-blue-600'>
            Take your time! You can always change this later in settings.
          </p>
        )}
      </div>

      {/* Error Message */}
      {state.error && (
        <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4'>
          <div className='flex items-center'>
            <span className='mr-2 text-red-500'>⚠️</span>
            <span className='text-red-700'>{state.error}</span>
          </div>
          <button
            onClick={() => setState(prev => ({ ...prev, error: null }))}
            className='mt-2 text-sm text-red-600 underline hover:text-red-700'
          >
            Try again
          </button>
        </div>
      )}

      {/* Role Cards */}
      <div className='mx-auto mb-8 grid max-w-2xl gap-6 md:grid-cols-2'>
        <RoleCard
          role='seller'
          title="I'M A SELLER"
          benefits={[
            'Create and manage products',
            'Set your own prices',
            'Keep 100% of revenue',
            'No commission fees ever',
          ]}
          isSelected={state.selectedRole === 'seller'}
          isLoading={state.isLoading && state.selectedRole === 'seller'}
          onSelect={handleRoleSelect}
          socialProofStats={socialProofStats}
        />

        <RoleCard
          role='buyer'
          title="I'M A BUYER"
          benefits={[
            'Browse amazing products',
            'Direct contact with sellers',
            'No hidden fees',
            'Support local businesses',
          ]}
          isSelected={state.selectedRole === 'buyer'}
          isLoading={state.isLoading && state.selectedRole === 'buyer'}
          onSelect={handleRoleSelect}
          socialProofStats={socialProofStats}
        />
      </div>

      {/* Loading State */}
      {state.isLoading && (
        <div className='mb-8 text-center'>
          <div className='mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-2 text-gray-600'>Setting up your account...</p>
        </div>
      )}

      {/* Help Section */}
      <RoleHelp socialProofStats={socialProofStats} />

      {/* Footer Note */}
      <div className='mt-8 text-center text-sm text-gray-500'>
        Don&apos;t worry! You can always change your role later in settings.
      </div>
    </div>
  )
}
