'use client'
// ═══════════════════════════════════════════════
// INFLLAX — Navbar Component
// File: src/components/layout/Navbar.tsx
// Stack: Next.js | Framer Motion | Tailwind CSS
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

// ── Logo Mark SVG ──
function LogoMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#ff6b1a" />
          <stop offset="100%" stopColor="#00c2a8" />
        </linearGradient>
      </defs>
      <polygon
        points="17,1 33,9.5 33,24.5 17,33 1,24.5 1,9.5"
        fill="url(#logo-grad)"
      />
      <text
        x="17" y="22"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fontFamily="sans-serif"
        fill="#04080f"
        letterSpacing="-0.5"
      >
        IX
      </text>
    </svg>
  )
}

// ── Mobile Menu ──
function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 h-[72px] border-b border-white/5">
            <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
              <LogoMark />
              <span className="font-display font-bold text-2xl text-ivory tracking-tight">
                Infllax
              </span>
            </Link>
            <button
              onClick={onClose}
              className="text-fog hover:text-ivory transition-colors p-1"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 flex flex-col justify-center px-7 gap-2">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block py-4 font-display font-semibold text-3xl text-fog hover:text-ivory transition-colors border-b border-white/5"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* CTA */}
          <div className="px-7 pb-10 flex flex-col gap-3">
            <Link
              href="#contact"
              onClick={onClose}
              className="btn-primary text-center justify-center text-base py-4"
            >
              Partner With Us →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main Navbar ──
export function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          'flex items-center justify-between px-14',
          scrolled
            ? 'h-[60px] bg-ink/96 border-b border-white/5'
            : 'h-[72px] bg-ink/88 border-b border-white/5',
          'backdrop-blur-2xl'
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <LogoMark />
          <span className="font-display font-bold text-[1.45rem] text-ivory tracking-tight leading-none">
            Infllax
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-desktop hidden lg:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative font-body text-sm font-medium text-fog',
                'hover:text-ivory transition-colors duration-200',
                'after:absolute after:bottom-[-4px] after:left-0 after:right-0',
                'after:h-px after:bg-saffron',
                'after:scale-x-0 hover:after:scale-x-100',
                'after:transition-transform after:duration-200'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="#contact" className="btn-ghost text-sm">
            Partner With Us
          </Link>
          <Link href="#contact" className="btn-fill text-sm">
            Get Started →
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden text-fog hover:text-ivory transition-colors p-1"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
