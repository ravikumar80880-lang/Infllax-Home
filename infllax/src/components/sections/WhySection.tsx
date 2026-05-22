'use client'
// ═══════════════════════════════════════════════
// INFLLAX — Why Section
// File: src/components/sections/WhySection.tsx
// ═══════════════════════════════════════════════

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { WHY_POINTS } from '@/lib/constants'

export function WhySection() {
  const headRef    = useRef<HTMLDivElement>(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section id="why" className="py-[120px]">
      <div className="section-container">
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="eyebrow mb-5">Why Infllax</div>
          <h2
            className="font-display font-bold text-ivory"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: '1.0', letterSpacing: '-2px' }}
          >
            What Makes Us<br />Different.
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-white/7">
          {WHY_POINTS.map((point, i) => {
            const ref      = useRef<HTMLDivElement>(null)
            const isInView = useInView(ref, { once: true, margin: '-40px' })

            return (
              <motion.div
                ref={ref}
                key={point.title}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="p-10 bg-deep border-r border-b border-white/7 hover:bg-surface transition-colors duration-200 last:border-b-0"
                style={{ padding: '40px 36px' }}
              >
                <div className="text-[1.6rem] mb-4">{point.icon}</div>
                <h3 className="font-display font-semibold text-ivory text-[1.1rem] mb-2.5 tracking-tight">
                  {point.title}
                </h3>
                <p className="text-fog text-[0.85rem] leading-[1.7] font-light">
                  {point.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
