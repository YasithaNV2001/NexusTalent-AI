import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'NexusTalent AI — Intelligent Talent Platform',
    template: '%s | NexusTalent AI',
  },
  description:
    'NexusTalent AI uses artificial intelligence to score your CV, suggest improvements, and help HR teams rank candidates against any job description. Try free today.',
  keywords: [
    'ATS score',
    'CV checker',
    'resume optimizer',
    'AI recruitment',
    'talent intelligence',
    'HR technology',
    'candidate ranking',
    'resume AI',
    'job application',
    'applicant tracking system',
  ],
  authors: [{ name: 'NexusTalent AI' }],
  creator: 'NexusTalent AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'NexusTalent AI — Intelligent Talent Platform',
    description:
      'AI-powered CV scoring for job seekers. Bulk candidate ranking for HR teams. Try free — no credit card required.',
    siteName: 'NexusTalent AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NexusTalent AI — Intelligent Talent Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexusTalent AI — Intelligent Talent Platform',
    description:
      'AI-powered CV scoring for job seekers. Bulk candidate ranking for HR teams.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(222 47% 8%)',
              border: '1px solid hsl(217 33% 18%)',
              color: 'hsl(210 40% 98%)',
            },
          }}
        />
      </body>
    </html>
  )
}