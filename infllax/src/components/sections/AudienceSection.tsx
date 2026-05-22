'use client'
// ═══════════════════════════════════════════════
// INFLLAX — Audience Section
// File: src/components/sections/AudienceSection.tsx
// Stack: Next.js | Framer Motion | Tailwind CSS
// ═══════════════════════════════════════════════

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { AUDIENCE_CARDS } from '@/lib/constants'

function AudienceCard({
  card,
  index,
}: {
  card: typeof AUDIENCE_CARDS[number]
  index: number
}) {
  const ref      = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="group relative bg-card border border-white/7 p-11 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-white/12"
      style={{ padding: '44px 36px' }}
    >
      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 w-20 h-20"
        style={{
          borderRadius: '0 0 0 80px',
          background: `${card.color}18`,
        }}
        aria-hidden="true"
      />

      {/* Emoji */}
      <span className="text-[2.2rem] mb-5 block">{card.emoji}</span>

      {/* Sub tag */}
      <p
        className="font-mono text-[0.65rem] tracking-[2px] uppercase mb-4 font-medium"
        style={{ color: card.color }}
      >
        {card.tag}
      </p>

      {/* Title */}
      <h3
        className="font-display font-semibold text-ivory mb-3"
        style={{ fontSize: '1.4rem', letterSpacing: '-0.5px', lineHeight: '1.2' }}
      >
        {card.title}
      </h3>

      {/* Description */}
      <p className="text-fog text-[0.875rem] leading-[1.72] font-light mb-8">
        {card.desc}
      </p>

      {/* Feature list */}
      <ul className="space-y-0">
        {card.points.map((point) => (
          <li
            key={point}
            className="flex items-start gap-2.5 text-[0.85rem] text-fog py-2.5 border-b border-white/5 last:border-b-0"
          >
            <span className="text-teal text-xs mt-0.5 flex-shrink-0">✓</span>
            {point}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export function AudienceSection() {
  const headRef    = useRef<HTMLDivElement>(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section
      id="audience"
      className="py-[120px] bg-deep border-t border-b border-white/5"
    >
      <div className="section-container">
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="eyebrow mb-5">Who We Serve</div>
          <h2
            className="font-display font-bold text-ivory"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: '1.0', letterSpacing: '-2px' }}
          >
            Built for Every<br />Stakeholder.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AUDIENCE_CARDS.map((card, i) => (
            <AudienceCard key={card.tag} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
