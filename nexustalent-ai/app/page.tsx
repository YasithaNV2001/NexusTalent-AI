import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import Features from '@/components/landing/Features'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'
import Contact from '@/components/landing/Contact'
import FAQ from '@/components/landing/FAQ'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'NexusTalent AI — Intelligent Talent Platform',
  description:
    'AI-powered CV scoring for job seekers. Bulk candidate ranking for HR teams. Start free — no credit card required.',
  alternates: { canonical: '/' },
}

export default function LandingPage() {
  return (
    <main className="relative bg-slate-950 overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/6 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-800/5 blur-[100px]" />
      </div>

      <Navbar />

      <section id="hero">
        <Hero />
      </section>

      <section id="how-it-works">
        <HowItWorks />
      </section>

      <section id="features">
        <Features />
      </section>

      <section id="pricing">
        <Pricing />
      </section>

      <section id="testimonials">
        <Testimonials />
      </section>

      <section id="contact">
        <Contact />
      </section>

      <section id="faq">
        <FAQ />
      </section>

      <Footer />
    </main>
  )
}