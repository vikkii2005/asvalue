'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { emailStepSchema, EmailStepData } from '@/lib/validations/seller-profile'

interface Props {
  user: User
  onComplete: (data: EmailStepData) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export default function EmailVerificationStep({ user, onComplete, isLoading, setIsLoading }: Props) {
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(0)
  const [formData, setFormData] = useState<EmailStepData | null>(null)
  
  const supabase = createClient()

  const form = useForm<EmailStepData>({
    resolver: zodResolver(emailStepSchema),
    defaultValues: {
      full_name: user.user_metadata?.full_name || '',
      email: user.email || ''
    }
  })

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Send email OTP
  const sendOTP = async (data: EmailStepData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: false // We already have the user
        }
      })
      
      if (error) throw error
      
      setFormData(data)
      setStep('otp')
      setCountdown(60)
    } catch (error: any) {
      alert('Failed to send verification code: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
    
    // Auto-submit when complete
    if (newOtp.every(digit => digit !== '') && formData) {
      verifyOTP(newOtp.join(''))
    }
  }

  // Verify OTP
  const verifyOTP = async (otpCode: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: formData!.email,
        token: otpCode,
        type: 'email'
      })
      
      if (error) throw error
      
      // Success! Move to next step
      onComplete(formData!)
    } catch (error: any) {
      alert('Invalid verification code. Please try again.')
      setOtp(['', '', '', '', '', '']) // Clear OTP
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const resendOTP = async () => {
    if (countdown > 0 || !formData) return
    
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email
      })
      
      if (error) throw error
      setCountdown(60)
    } catch (error: any) {
      alert('Failed to resend code: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'form') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            📧 Verify Your Email
          </h2>
          <p className="text-gray-600">
            We'll send you a verification code to get started
          </p>
        </div>

        <form onSubmit={form.handleSubmit(sendOTP)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              {...form.register('full_name')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
            {form.formState.errors.full_name && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.full_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              {...form.register('email')}
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Sending Code...' : 'Send Verification Code'}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📧 Check Your Email
        </h2>
        <p className="text-gray-600">
          We sent a 6-digit code to <strong>{formData?.email}</strong>
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center space-x-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={1}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Resend Button */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={resendOTP}
          disabled={countdown > 0 || isLoading}
          className="text-blue-600"
        >
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
        </Button>
      </div>
    </div>
  )
}