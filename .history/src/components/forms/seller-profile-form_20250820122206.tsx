'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Progress } from '@/components/ui/progress'
import EmailVerificationStep from './email-verification-step'
import BusinessInfoStep from './business-info-step'
import { EmailStepData } from '@/lib/validations/seller-profile'

interface Category {
  id: string
  name: string
  emoji: string
  description: string
  popular: boolean
}

interface City {
  id: string
  city: string
  state: string
  popular: boolean
}

interface Props {
  user: User
  categories: Category[]
  cities: City[]
}

export default function SellerProfileForm({ user, categories, cities }: Props) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [emailData, setEmailData] = useState<EmailStepData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const progressPercentage = (currentStep / 3) * 100

  const handleEmailComplete = (data: EmailStepData) => {
    setEmailData(data)
    setCurrentStep(2)
  }

  const handleAllComplete = () => {
    router.push('/onboarding/success')
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of 3</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
        
        {/* Step Labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span className={currentStep === 1 ? 'font-bold text-blue-600' : ''}>
            📧 Email Verify
          </span>
          <span className={currentStep === 2 ? 'font-bold text-blue-600' : ''}>
            🏢 Business Info
          </span>
          <span className={currentStep === 3 ? 'font-bold text-blue-600' : ''}>
            ✅ Complete
          </span>
        </div>
      </div>

      {/* Step 1: Email Verification */}
      {currentStep === 1 && (
        <EmailVerificationStep
          user={user}
          onComplete={handleEmailComplete}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}

      {/* Step 2: Business Information */}
      {currentStep === 2 && emailData && (
        <BusinessInfoStep
          user={user}
          emailData={emailData}
          categories={categories}
          cities={cities}
          onComplete={handleAllComplete}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
    </div>
  )
}