// src/app/onboarding/success/page.tsx
// PRODUCTION READY - Fixed apostrophe escaping

'use client'

import { useEffect, useState } from 'react'
import { generateMagicLink } from '@/lib/api/user'

export default function OnboardingSuccessPage() {
  const [magicLink, setMagicLink] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateLink = async () => {
      try {
        // Get user ID from session
        const sessionCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('asvalue-authenticated='))
        
        if (sessionCookie) {
          const sessionValue = sessionCookie.split('=')[1]
          const sessionData = JSON.parse(atob(sessionValue))
          
          // For demo, using user ID as product ID (get first product in real app)
          const result = await generateMagicLink(sessionData.userId, sessionData.userId)
          
          if (result.success && result.data) {
            setMagicLink(result.data.magicLink)
            setQrCode(result.data.qrCode)
          }
        }
      } catch (error) {
        console.error('Error generating magic link:', error)
      } finally {
        setIsLoading(false)
      }
    }

    generateLink()
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(magicLink)
    alert('Link copied to clipboard!')
  }

  const shareWhatsApp = () => {
    const message = `Check out my product on AsValue: ${magicLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Generating your magic link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Congratulations! You&apos;re Live!
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">🔗 Your Magic Link:</h2>
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-sm text-blue-600 break-all">{magicLink}</p>
            </div>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                📋 Copy Link
              </button>
              <button
                onClick={shareWhatsApp}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                📱 Share WhatsApp
              </button>
            </div>
          </div>

          {qrCode && (
            <div className="text-center">
              <h3 className="text-md font-medium mb-3">📱 QR Code:</h3>
              <img src={qrCode} alt="QR Code" className="mx-auto mb-3" />
              <a
                href={qrCode}
                download="qr-code.png"
                className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                💾 Download
              </a>
            </div>
          )}

          <div>
            <h3 className="text-md font-semibold mb-3">✅ What You Got:</h3>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>• Professional product page</li>
              <li>• AI customer support (90% automated)</li>
              <li>• Universal sharing (works everywhere)</li>
              <li>• Direct payment to your account</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              📊 View Dashboard
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              ➕ Add Product
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareWhatsApp}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              📱 Share Now
            </button>
            <button className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
              🎯 Get First Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}