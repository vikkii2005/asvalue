// src/components/onboarding/role-card.tsx
// FIXED - ESLint compliant

import React, { useRef } from 'react'
import { RoleCardProps } from '@/lib/types/user'
import { trackRoleHover } from '@/lib/analytics/role-selection'
import AuthenticSocialProof from './authentic-social-proof'

export default function RoleCard({
  role,
  title,
  benefits,
  isSelected,
  isLoading,
  onSelect,
  socialProofStats,
}: RoleCardProps) {
  const hoverStartTime = useRef<number>(0)

  const handleMouseEnter = () => {
    hoverStartTime.current = Date.now()
  }

  const handleMouseLeave = () => {
    if (hoverStartTime.current) {
      const duration = Date.now() - hoverStartTime.current
      trackRoleHover(role, duration, 'current-user')
    }
  }

  const handleClick = () => {
    if (!isLoading) {
      onSelect(role)
    }
  }

  const cardIcon = role === 'seller' ? '🛒' : '🛍️'
  const borderColor =
    role === 'seller' ? 'border-blue-500' : 'border-purple-500'
  const bgColor = role === 'seller' ? 'bg-blue-50' : 'bg-purple-50'
  const hoverBorderColor =
    role === 'seller' ? 'hover:border-blue-500' : 'hover:border-purple-500'

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`cursor-pointer rounded-xl border-2 bg-white p-8 transition-all duration-200 hover:scale-105 hover:shadow-lg ${hoverBorderColor} ${isSelected ? `${borderColor} ${bgColor}` : 'border-gray-200'} ${isLoading ? 'cursor-not-allowed opacity-50' : ''} `}
      role='button'
      tabIndex={0}
      aria-label={`Select ${role} role. ${title}`}
      aria-pressed={isSelected}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className='text-center'>
        <div className='mb-4 text-4xl' role='img' aria-label={`${role} icon`}>
          {cardIcon}
        </div>

        <h3 className='mb-4 text-xl font-bold text-gray-900'>{title}</h3>

        <ul className='mb-6 space-y-2 text-left' role='list'>
          {benefits.map((benefit, index) => (
            <li key={index} className='flex items-center' role='listitem'>
              <span className='mr-2 text-green-500' aria-hidden='true'>
                ✅
              </span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <AuthenticSocialProof
          role={role}
          stats={socialProofStats}
          className='mb-4'
        />

        {isLoading && (
          <div className='mt-4 flex items-center justify-center'>
            <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600'></div>
            <span className='ml-2 text-sm text-gray-600'>Selecting...</span>
          </div>
        )}
      </div>
    </div>
  )
}
