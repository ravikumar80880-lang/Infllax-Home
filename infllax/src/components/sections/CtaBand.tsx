'use client'
// ═══════════════════════════════════════════════
// INFLLAX — CTA Band
// File: src/components/sections/CtaBand.tsx
// ═══════════════════════════════════════════════

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export function CtaBand() {
  const ref      = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      className="relative py-[100px] text-center overflow-hidden border-t border-b"
      style={{
        background: 'linear-gradient(135deg, rgba(255,107,26,0.12) 0%, rgba(0,194,168,0.08) 100%)',
        borderColor: 'rgba(255,107,26,0.2)',
      }}
    >
      {/* Watermark text */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-bold whitespace-nowrap pointer-events-none select-none"
        style={{ fontSize: '20vw', color: 'rgba(255,255,255,0.015)', letterSpacing: '-8px' }}
        aria-hidden="true"
      >
        INFLLAX
      </div>

      <div ref={ref} className="relative z-10 section-container">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-display font-bold text-ivory mb-5"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: '0.95', letterSpacing: '-2.5px' }}
        >
          India's Entertainment<br />Future Starts Here.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-fog text-[1rem] max-w-[440px] mx-auto mb-10 font-light leading-[1.7]"
        >
          Whether you are an advertiser, creator, investor, or theater owner — there is a place for you inside Infllax. Let's build together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link href="#contact" className="btn-primary text-base">
            Partner With Infllax →
          </Link>
          <Link href="#services" className="btn-outline text-base">
            Explore Our Platform
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
