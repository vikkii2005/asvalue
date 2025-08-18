// src/components/onboarding/authentic-social-proof.tsx
// FIXED - ESLint compliant

import React from 'react'
import { SocialProofData, UserRole } from '@/lib/types/user'

interface AuthenticSocialProofProps {
  role: UserRole
  stats: SocialProofData
  className?: string
}

const getAuthenticMessage = (
  role: UserRole,
  stats: SocialProofData
): string => {
  const {
    seller_count,
    buyer_count: _buyer_count,
    days_live: _days_live,
  } = stats

  if (role === 'seller') {
    if (seller_count === 0) return '🚀 Be among the first sellers!'
    if (seller_count < 10) return '🌟 Join our founding sellers'
    if (seller_count < 50) return `👥 Join ${seller_count}+ early sellers`
    return `👥 Join ${seller_count}+ active sellers`
  } else {
    if (seller_count === 0) return '🛍️ Discover amazing products soon'
    if (seller_count < 10) return '🛍️ Shop from founding sellers'
    if (seller_count < 100) return `🛍️ Shop from ${seller_count}+ sellers`
    return `🛍️ Browse thousands of products`
  }
}

export default function AuthenticSocialProof({
  role,
  stats,
  className = '',
}: AuthenticSocialProofProps) {
  const message = getAuthenticMessage(role, stats)
  const isGrowthPhase = stats.seller_count > 0

  return (
    <div
      className={`text-sm font-medium ${
        role === 'seller' ? 'text-blue-600' : 'text-purple-600'
      } ${className}`}
    >
      {message}
      {isGrowthPhase && stats.days_live > 0 && (
        <div className='mt-1 text-xs text-gray-500'>
          Growing since {stats.days_live} days
        </div>
      )}
    </div>
  )
}
