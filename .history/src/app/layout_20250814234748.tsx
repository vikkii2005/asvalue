import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers'
import PerformanceOptimizer from '@/components/PerformanceOptimizer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap' // 🚀 Faster font loading
})

export const metadata: Metadata = {
  title: 'ASVALUE - AI Sales Platform',
  description: 'Professional AI-powered sales platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* 🚀 Preload critical resources */}
        <link rel="dns-prefetch" href="//accounts.google.com" />
        <link rel="dns-prefetch" href="//apis.google.com" />
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://apis.google.com" />
      </head>
      <body className={inter.className}>
        <PerformanceOptimizer />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}