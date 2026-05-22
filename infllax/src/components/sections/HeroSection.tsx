'use client'
// ═══════════════════════════════════════════════
// INFLLAX — Hero Section
// File: src/components/sections/HeroSection.tsx
// Stack: Next.js | Framer Motion | Tailwind CSS
// ═══════════════════════════════════════════════

import Link from 'next/link'
import { motion } from 'framer-motion'

// ── Animation Variants ──
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
}

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
}

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ paddingTop: 'calc(var(--nav-h) + 40px)', paddingBottom: '80px' }}
    >
      {/* ── GRID BACKGROUND ── */}
      <div
        className="absolute inset-0 z-0 grid-bg"
        aria-hidden="true"
      />

      {/* ── AMBIENT ORBS ── */}
      <div
        aria-hidden="true"
        className="absolute -top-[200px] -right-[200px] w-[700px] h-[700px] rounded-full pointer-events-none animate-drift-1"
        style={{ background: 'radial-gradient(circle, rgba(255,107,26,0.12) 0%, transparent 65%)', filter: 'blur(100px)' }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-[150px] -left-[150px] w-[600px] h-[600px] rounded-full pointer-events-none animate-drift-2"
        style={{ background: 'radial-gradient(circle, rgba(0,194,168,0.10) 0%, transparent 65%)', filter: 'blur(100px)' }}
      />

      {/* ── HERO CONTENT ── */}
      <motion.div
        className="relative z-10 max-w-[900px] mx-auto px-7 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow Badge */}
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-9 border border-saffron/35 bg-saffron/7 font-mono text-saffron text-[0.7rem] tracking-[2px] uppercase">
            <span
              className="w-1.5 h-1.5 rounded-full bg-saffron animate-blink"
              aria-hidden="true"
            />
            India's Unified Entertainment Infrastructure
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-display font-bold text-ivory mb-7"
          style={{ fontSize: 'clamp(3.2rem, 7.5vw, 7rem)', lineHeight: '0.92', letterSpacing: '-3px' }}
        >
          One Platform.{' '}
          <br />
          <span className="text-gradient-brand">Infinite Reach.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          className="text-fog font-light max-w-[560px] mx-auto mb-11"
          style={{ fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', lineHeight: '1.75' }}
        >
          Infllax connects advertisers, content creators, theater owners, and investors through a single, transparent, technology-driven media ecosystem — built for India, designed for scale.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="#contact" className="btn-primary text-base">
            Partner With Us →
          </Link>
          <Link href="#services" className="btn-outline text-base">
            Explore Our Platform
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={fadeIn}
          className="mt-16 pt-10 border-t border-white/5 grid grid-cols-3 gap-0 max-w-[560px] mx-auto"
        >
          {[
            { val: '5,000+', label: 'Theaters'        },
            { val: '4',      label: 'Verticals'       },
            { val: 'Pan-India', label: 'Distribution' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center px-4 ${i < 2 ? 'border-r border-white/7' : ''}`}
            >
              <div
                className="font-display font-bold text-ivory mb-1"
                style={{ fontSize: '1.8rem', letterSpacing: '-1px' }}
              >
                {stat.val}
              </div>
              <div className="font-mono text-dim text-[0.62rem] tracking-[2px] uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── SCROLL INDICATOR ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        aria-hidden="true"
      >
        <div
          className="w-px h-12 animate-scroll-pulse"
          style={{ background: 'linear-gradient(to bottom, #ff6b1a, transparent)' }}
        />
        <span className="font-mono text-[0.6rem] tracking-[3px] uppercase text-dim">
          Scroll
        </span>
      </motion.div>
    </section>
  )
}
