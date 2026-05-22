// ═══════════════════════════════════════════════
// INFLLAX — Root Layout
// File: src/app/layout.tsx
// Stack: Next.js 14 App Router | Tailwind CSS
// ═══════════════════════════════════════════════

import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'

// ── METADATA ──
export const metadata: Metadata = {
  title: {
    default:  'Infllax — India\'s Unified Entertainment Infrastructure',
    template: '%s | Infllax',
  },
  description:
    'Infllax connects advertisers, creators, theater owners, and investors through a single transparent, technology-driven media ecosystem — built for India, designed for scale.',
  keywords: [
    'OTT platform India',
    'theater advertising',
    'content distribution India',
    'creator monetization',
    'film distribution',
    'digital cinema advertising',
    'Indian streaming platform',
    'regional content OTT',
  ],
  authors:  [{ name: 'Infllax', url: 'https://infllax.com' }],
  creator:  'Infllax',
  metadataBase: new URL('https://infllax.com'),
  openGraph: {
    type:        'website',
    locale:      'en_IN',
    url:         'https://infllax.com',
    title:       'Infllax — India\'s Unified Entertainment Infrastructure',
    description: 'One Platform. Infinite Reach. Theater Ads + OTT + Distribution + Creator Monetization.',
    siteName:    'Infllax',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Infllax — India\'s Unified Entertainment Infrastructure',
    description: 'One Platform. Infinite Reach.',
    creator:     '@infllax',
  },
  robots: {
    index:   true,
    follow:  true,
    googleBot: { index: true, follow: true },
  },
}

export const viewport: Viewport = {
  themeColor: '#04080f',
  width:      'device-width',
  initialScale: 1,
}

// ── ROOT LAYOUT ──
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Fonts — Clash Display + Satoshi + JetBrains Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* Clash Display + Satoshi via CDN fallback */}
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap');
          :root {
            --font-clash:     'Clash Display', sans-serif;
            --font-satoshi:   'Satoshi', sans-serif;
            --font-jetbrains: 'JetBrains Mono', monospace;
          }
        ` }} />
      </head>
      <body className="bg-ink text-ivory antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
