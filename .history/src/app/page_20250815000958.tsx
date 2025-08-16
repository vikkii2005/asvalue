import Header from '@/components/landing/header'
import Hero from '@/components/landing/hero'
import Features from '@/components/landing/features'
import HowItWorks from '@/components/landing/how-it-works'
import Footer from '@/components/landing/footer'
import AuthDebug from '@/components/AuthDebug'

export default function HomePage() {
  return (
    <div className='min-h-screen bg-white'>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
      <AuthDebug />
    </div>
  )
}