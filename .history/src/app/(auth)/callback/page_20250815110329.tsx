// src/app/auth/callback/page.tsx
'use client'
import { useEffect } from 'react'
import { getRedirectResult } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          router.push('/dashboard')
        } else {
          router.push('/')
        }
      })
      .catch(() => router.push('/'))
  }, [router])

  return <p>Loading...</p>
}