import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ASVALUE - AI-Powered E-commerce Sales Assistant',
  description: 'Turn any product into an intelligent sales chatbot. Boost conversions with AI-powered customer interactions.',
  keywords: 'AI sales assistant, e-commerce chatbot, product sales, customer service automation',
  authors: [{ name: 'ASVALUE Team' }],
  creator: 'ASVALUE',
  publisher: 'ASVALUE',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://asvalue.com',
    title: 'ASVALUE - AI-Powered E-commerce Sales Assistant',
    description: 'Turn any product into an intelligent sales chatbot. Boost conversions with AI-powered customer interactions.',
    siteName: 'ASVALUE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASVALUE - AI-Powered E-commerce Sales Assistant',
    description: 'Turn any product into an intelligent sales chatbot. Boost conversions with AI-powered customer interactions.',
    creator: '@asvalue',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='scroll-smooth'>
      <head>
        <link rel='icon' href='/favicon.ico' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
        <div id='modal-root' />
      </body>
    </html>
  )
}