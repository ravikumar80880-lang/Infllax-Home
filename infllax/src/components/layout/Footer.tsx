'use client'
// ═══════════════════════════════════════════════
// INFLLAX — Footer Component
// File: src/components/layout/Footer.tsx
// Stack: Next.js | Tailwind CSS
// ═══════════════════════════════════════════════

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FOOTER_LINKS } from '@/lib/constants'

// ── Social Icons ──
const SOCIALS = [
  { label: 'LinkedIn',  handle: 'in',   href: '#' },
  { label: 'Twitter/X', handle: '𝕏',    href: '#' },
  { label: 'Instagram', handle: 'ig',   href: '#' },
  { label: 'YouTube',   handle: 'yt',   href: '#' },
]

export function Footer() {
  return (
    <footer className="bg-deep border-t border-white/5">
      {/* ── MAIN FOOTER ── */}
      <div className="section-container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 mb-14">

          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="30" height="30" viewBox="0 0 34 34" fill="none">
                <defs>
                  <linearGradient id="footer-logo" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="#ff6b1a" />
                    <stop offset="100%" stopColor="#00c2a8" />
                  </linearGradient>
                </defs>
                <polygon points="17,1 33,9.5 33,24.5 17,33 1,24.5 1,9.5" fill="url(#footer-logo)" />
                <text x="17" y="22" textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="sans-serif" fill="#04080f" letterSpacing="-0.5">IX</text>
              </svg>
              <span className="font-display font-bold text-xl text-ivory tracking-tight">
                Infllax
              </span>
            </div>

            <p className="text-small text-fog leading-relaxed mb-6 max-w-[240px]">
              India's unified entertainment infrastructure — connecting advertisers, creators, theater owners, and investors through transparent, technology-driven media.
            </p>

            {/* Socials */}
            <div className="flex gap-3">
              {SOCIALS.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 border border-white/7 flex items-center justify-center text-fog text-sm hover:border-saffron hover:text-saffron transition-all duration-200"
                >
                  {s.handle}
                </Link>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-mono text-saffron tracking-[2.5px] uppercase text-[0.65rem] mb-5">
              Platform
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-small text-fog hover:text-ivory transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="text-dim text-xs">→</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-mono text-saffron tracking-[2.5px] uppercase text-[0.65rem] mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-small text-fog hover:text-ivory transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="text-dim text-xs">→</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners Links */}
          <div>
            <h4 className="font-mono text-saffron tracking-[2.5px] uppercase text-[0.65rem] mb-5">
              Partners
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.partners.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-small text-fog hover:text-ivory transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="text-dim text-xs">→</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[0.62rem] tracking-wide text-dim text-center sm:text-left">
            © {new Date().getFullYear()} Infllax. All rights reserved. India's Unified Entertainment Infrastructure.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'Legal'].map((item) => (
              <Link
                key={item}
                href="#"
                className="font-mono text-[0.6rem] tracking-wide text-dim hover:text-fog transition-colors duration-200"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
