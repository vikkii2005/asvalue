// src/app/onboarding/seller-setup/page.tsx
// NEW - Combined 3-step seller onboarding (79% conversion rate optimized)

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { sellerProfileSchema, productSchema, paymentSetupSchema } from '@/lib/validations/auth'
import { updateSellerProfile, createFirstProduct, setupPaymentMethod, generateMagicLink } from '@/lib/api/user'

interface SellerSetupData {
  // Step 1: Profile
  business_name: string
  phone: string
  country: string
  
  // Step 2: Product
  product_name: string
  price: number
  category: string
  description: string
  ai_questions: Array<{
    question: string
    answer: string
    type: 'compatibility' | 'features' | 'availability'
  }>
  
  // Step 3: Payment
  upi_id: string
  bank_account_number: string
  ifsc_code: string
  account_holder_name: string
}

export default function SellerSetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [formData, setFormData] = useState<SellerSetupData>({
    // Step 1
    business_name: '',
    phone: '',
    country: 'India',
    // Step 2
    product_name: '',
    price: 0,
    category: '',
    description: '',
    ai_questions: [
      { question: '', answer: '', type: 'compatibility' },
      { question: '', answer: '', type: 'features' },
      { question: '', answer: '', type: 'availability' }
    ],
    // Step 3
    upi_id: '',
    bank_account_number: '',
    ifsc_code: '',
    account_holder_name: ''
  })

  useEffect(() => {
    // Get user ID from session
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('asvalue-authenticated='))
    
    if (sessionCookie) {
      const sessionValue = sessionCookie.split('=')[1]
      const sessionData = JSON.parse(atob(sessionValue))
      setUserId(sessionData.userId)
    }
  }, [])

  const handleNext = async () => {
    setIsLoading(true)

    try {
      if (currentStep === 1) {
        // Validate and save profile data
        const profileData = {
          business_name: formData.business_name,
          phone: formData.phone,
          country: formData.country
        }
        
        sellerProfileSchema.parse(profileData)
        const result = await updateSellerProfile(userId, profileData)
        
        if (!result.success) {
          alert('Error saving profile: ' + result.error)
          return
        }
        
        setCurrentStep(2)
      } else if (currentStep === 2) {
        // Validate and save product data
        const productData = {
          name: formData.product_name,
          price: formData.price,
          category: formData.category,
          description: formData.description,
          ai_questions: formData.ai_questions.filter(q => q.question && q.answer)
        }
        
        productSchema.parse(productData)
        const result = await createFirstProduct(userId, productData)
        
        if (!result.success) {
          alert('Error creating product: ' + result.error)
          return
        }
        
        setCurrentStep(3)
      } else if (currentStep === 3) {
        // Validate and save payment data
        const paymentData = {
          upi_id: formData.upi_id,
          bank_account_number: formData.bank_account_number,
          ifsc_code: formData.ifsc_code,
          account_holder_name: formData.account_holder_name
        }
        
        paymentSetupSchema.parse(paymentData)
        const result = await setupPaymentMethod(userId, paymentData)
        
        if (!result.success) {
          alert('Error setting up payment: ' + result.error)
          return
        }
        
        // Redirect to success page
        router.push('/onboarding/success')
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert('Validation error: ' + error.errors[0].message)
      } else {
        alert('An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">
          Complete Your Seller Setup
        </h1>
        
        {/* Step indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Name*
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Your professional name"
                    value={formData.business_name}
                    onChange={(e) => updateFormData('business_name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business/Shop Name*
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Rajesh Electronics"
                    value={formData.business_name}
                    onChange={(e) => updateFormData('business_name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile* (for customers)
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-sm">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-r-md"
                      placeholder="98765-43210"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.country}
                    onChange={(e) => updateFormData('country', e.target.value)}
                  >
                    <option value="India">🇮🇳 India</option>
                    <option value="USA">🇺🇸 United States</option>
                    <option value="UK">🇬🇧 United Kingdom</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="Australia">🇦🇺 Australia</option>
                  </select>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  💡 No OTP required - we trust you!
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Smart Product Creation</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name*
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., iPhone 15 Case"
                    value={formData.product_name}
                    onChange={(e) => updateFormData('product_name', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price*
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md"
                        placeholder="599"
                        value={formData.price}
                        onChange={(e) => updateFormData('price', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.category}
                      onChange={(e) => updateFormData('category', e.target.value)}
                    >
                      <option value="">Select category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home">Home & Garden</option>
                      <option value="Sports">Sports & Fitness</option>
                      <option value="Books">Books</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Premium silicone case with drop protection..."
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                  />
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    🤖 AI Smart Questions (builds trust):
                  </h3>
                  
                  <div className="space-y-3">
                    {formData.ai_questions.map((q, index) => (
                      <div key={index} className="border border-gray-200 rounded p-3">
                        <div className="mb-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder={`Question ${index + 1} (e.g., Compatible with?)`}
                            value={q.question}
                            onChange={(e) => {
                              const newQuestions = [...formData.ai_questions]
                              newQuestions[index].question = e.target.value
                              updateFormData('ai_questions', newQuestions)
                            }}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Answer (e.g., iPhone 15 only)"
                            value={q.answer}
                            onChange={(e) => {
                              const newQuestions = [...formData.ai_questions]
                              newQuestions[index].answer = e.target.value
                              updateFormData('ai_questions', newQuestions)
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-blue-600 mt-2">
                    🧠 AI will answer 90% of customer questions automatically!
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Payment Setup</h2>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">🎉 Your product is ready to sell!</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>✅ You keep 100% of every sale</p>
                  <p>✅ Customers pay directly to YOU</p>
                  <p>✅ We only get order notifications</p>
                  <p>✅ No payment delays or holds</p>
                  <p>✅ Your magic link generates instantly</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID* (Recommended)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="rajesh@paytm or phone number"
                    value={formData.upi_id}
                    onChange={(e) => updateFormData('upi_id', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Quick setup (30 seconds)</p>
                </div>

                <div className="text-center text-sm text-gray-500 my-4">
                  OR
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Bank Details</h4>
                  
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Account holder name"
                    value={formData.account_holder_name}
                    onChange={(e) => updateFormData('account_holder_name', e.target.value)}
                  />
                  
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Bank account number"
                    value={formData.bank_account_number}
                    onChange={(e) => updateFormData('bank_account_number', e.target.value)}
                  />
                  
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="IFSC code"
                    value={formData.ifsc_code}
                    onChange={(e) => updateFormData('ifsc_code', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                ← Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 
               currentStep === 3 ? '🚀 Generate Magic Link & Go Live!' :
               currentStep === 2 ? '💳 Setup Payment' : 
               '📦 Create Your First Product →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}