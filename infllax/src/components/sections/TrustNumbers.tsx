'use client'
// ═══════════════════════════════════════════════
// INFLLAX — Trust Numbers Section
// File: src/components/sections/TrustNumbers.tsx
// Stack: React | Framer Motion | Tailwind CSS
// ═══════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { TRUST_STATS } from '@/lib/constants'
import { animateCounter } from '@/lib/utils'

// ── Individual Stat Item ──
function StatItem({
  stat,
  index,
}: {
  stat: typeof TRUST_STATS[number]
  index: number
}) {
  const ref      = useRef<HTMLDivElement>(null)
  const numRef   = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [counted, setCounted] = useState(false)

  useEffect(() => {
    if (isInView && !counted && numRef.current && 'animated' in stat && stat.animated) {
      setCounted(true)
      animateCounter(numRef.current, (stat as { value: number }).value)
    }
  }, [isInView, counted, stat])

  const displayValue = 'display' in stat
    ? (stat as { display: string }).display
    : 'value' in stat
      ? (stat as { value: number }).value.toLocaleString('en-IN') +
        ((stat as { value: number }).value === 5000 ? '+' : '')
      : ''

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="px-10 py-[52px] border-r border-white/7 last:border-r-0"
    >
      <div
        ref={numRef}
        className="font-display font-bold mb-2.5"
        style={{
          fontSize:      'clamp(2.4rem, 4vw, 3.6rem)',
          lineHeight:    '1',
          letterSpacing: '-2px',
          color:         stat.color,
        }}
      >
        {displayValue}
      </div>
      <p className="text-fog text-[0.82rem] font-normal leading-snug whitespace-pre-line">
        {stat.label}
      </p>
    </motion.div>
  )
}

// ── Main Component ──
export function TrustNumbers() {
  return (
    <section
      aria-label="Platform statistics"
      className="border-t border-white/7 border-b border-b-white/7"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {TRUST_STATS.map((stat, i) => (
          <StatItem key={i} stat={stat} index={i} />
        ))}
      </div>
    </section>
  )
}
