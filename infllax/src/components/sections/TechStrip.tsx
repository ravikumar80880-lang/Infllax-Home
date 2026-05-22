'use client'
// ═══════════════════════════════════════════════
// INFLLAX — Tech Strip
// File: src/components/sections/TechStrip.tsx
// Shows exact technology stack from PDF
// ═══════════════════════════════════════════════

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { TECH_STACK } from '@/lib/constants'

export function TechStrip() {
  const ref      = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="py-12 border-t border-b border-white/5"
      style={{ background: 'var(--surface)' }}
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-wrap"
        >
          {/* Label */}
          <span className="font-mono text-[0.65rem] tracking-[3px] uppercase text-dim flex-shrink-0">
            Built On
          </span>
          <div className="w-px h-5 bg-white/7 hidden sm:block flex-shrink-0" />

          {/* Pills */}
          <div className="flex flex-wrap gap-2.5">
            {TECH_STACK.map((tech, i) => (
              <motion.span
                key={tech.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="px-3 py-1.5 border border-white/7 font-mono text-[0.68rem] tracking-wide text-fog cursor-default transition-all duration-200 hover:border-saffron hover:text-saffron"
                title={tech.role}
              >
                {tech.label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
