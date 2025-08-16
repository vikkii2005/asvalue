import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { APP_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { AuthProvider } from '@/components/auth/AuthProvider' // your AuthProvider
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  keywords: [
    'AI sales',
    'magic links',
    'product sharing',
    'e-commerce',
    'WhatsApp selling',
    'QR codes',
    'online selling',
    'AI customer service',
    'social commerce',
    'mobile selling',
  ],
  authors: [{ name: APP_CONFIG.name }],
  creator: APP_CONFIG.name,
  publisher: APP_CONFIG.name,
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL(APP_CONFIG.url),
  alternates: { canonical: '/' },
  openGraph: {
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.name,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: `${APP_CONFIG.name} - AI-powered sales platform` }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: APP_CONFIG.name, description: APP_CONFIG.description, images: ['/og-image.jpg'], creator: '@asvalue' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  category: 'technology',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn('bg-background min-h-screen font-sans antialiased', inter.variable)}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:outline-none focus:ring-2 bg-primary text-primary-foreground rounded-md px-4 py-2 transition-colors">
              Skip to main content
            </a>

            <main id="main-content" className="flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>

        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}