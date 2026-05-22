'use client'
// ═══════════════════════════════════════════════
// INFLLAX — How It Works Section
// File: src/components/sections/HowItWorks.tsx
// ═══════════════════════════════════════════════

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { HOW_STEPS } from '@/lib/constants'

export function HowItWorks() {
  const headRef    = useRef<HTMLDivElement>(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section
      id="how"
      className="py-[120px] bg-deep border-t border-b border-white/5"
    >
      <div className="section-container">
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-[72px]"
        >
          <div className="eyebrow mb-5">The Process</div>
          <h2
            className="font-display font-bold text-ivory"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: '1.0', letterSpacing: '-2px' }}
          >
            How Infllax Works<br />For You.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 relative">
          {/* Connector line (desktop only) */}
          <div
            className="hidden lg:block absolute top-9 left-[12.5%] right-[12.5%] h-px z-0"
            style={{ background: 'linear-gradient(90deg, #ff6b1a, #00c2a8)' }}
            aria-hidden="true"
          />

          {HOW_STEPS.map((step, i) => {
            const ref      = useRef<HTMLDivElement>(null)
            const isInView = useInView(ref, { once: true, margin: '-40px' })

            return (
              <motion.div
                ref={ref}
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="relative z-10 flex flex-col items-center text-center px-5 mb-10 lg:mb-0"
              >
                {/* Step number circle */}
                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-display text-[1.4rem] font-bold mb-6 flex-shrink-0"
                  style={
                    step.filled
                      ? { background: step.color, color: '#04080f' }
                      : {
                          background: 'var(--surface)',
                          border: `1px solid ${step.color}`,
                          color: step.color,
                        }
                  }
                >
                  {step.num}
                </div>

                <h3 className="font-display font-semibold text-ivory text-[1.1rem] mb-2.5 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-fog text-[0.82rem] leading-[1.6] font-light">
                  {step.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
