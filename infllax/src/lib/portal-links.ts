// ═══════════════════════════════════════════════════════
// INFLLAX — Portal Links (Corporate Site → DCMS Portals)
// File: infllax-corporate/src/lib/portal-links.ts
// These links connect the corporate site to DCMS portals
// ═══════════════════════════════════════════════════════

export const PORTAL_LINKS = {
  // Theater Owner Portal (Next.js — port 3001)
  theaterPortal:    process.env.NEXT_PUBLIC_THEATER_URL    || 'http://localhost:3001',

  // Advertiser Campaign Panel (Next.js — port 3002)
  advertiserPanel:  process.env.NEXT_PUBLIC_ADVERTISER_URL || 'http://localhost:3002',

  // Admin/Founder Control Panel (Next.js — port 3003, future)
  adminPanel:       process.env.NEXT_PUBLIC_ADMIN_URL      || 'http://localhost:3003',

  // Backend API (Node.js Express — port 5000)
  backendAPI:       process.env.NEXT_PUBLIC_API_URL        || 'http://localhost:5000',
} as const

// ── Portal CTA Buttons for Contact Section ──
export const PORTAL_CTAS = [
  {
    label:  'Theater Owner Portal',
    desc:   'List your theater and manage ad schedules',
    href:   PORTAL_LINKS.theaterPortal,
    color:  '#ff6b1a',
    icon:   '🎬',
  },
  {
    label:  'Advertiser Portal',
    desc:   'Create and manage your ad campaigns',
    href:   PORTAL_LINKS.advertiserPanel,
    color:  '#00c2a8',
    icon:   '📢',
  },
] as const
