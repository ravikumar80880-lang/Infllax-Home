'use client'
// ═══════════════════════════════════════════════
// INFLLAX — Services Section
// File: src/components/sections/ServicesSection.tsx
// Stack: Next.js | Framer Motion | Tailwind CSS
// ═══════════════════════════════════════════════

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { SERVICES } from '@/lib/constants'
import { cn } from '@/lib/utils'

// ── Service Card ──
function ServiceCard({
  service,
  index,
}: {
  service: typeof SERVICES[number]
  index: number
}) {
  const ref      = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'group relative bg-deep p-13 overflow-hidden cursor-default',
        'border-b border-r border-white/7',
        'transition-all duration-300 hover:bg-surface',
        // Remove right border on even cards
        index % 2 === 1 ? 'border-r-0' : '',
        // Remove bottom border on last row
        index >= 2 ? 'border-b-0' : '',
      )}
      style={{ padding: '52px 48px' }}
    >
      {/* Top accent line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: service.color }}
        aria-hidden="true"
      />

      {/* Service number */}
      <p className="font-mono text-dim text-[0.65rem] tracking-[2px] uppercase mb-7">
        {service.id} — {service.tag}
      </p>

      {/* Icon */}
      <div className="w-[52px] h-[52px] border border-white/7 flex items-center justify-center text-2xl mb-6">
        {service.icon}
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-ivory mb-3.5"
        style={{ fontSize: '1.55rem', lineHeight: '1.2', letterSpacing: '-0.5px' }}
      >
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-fog text-[0.9rem] leading-[1.75] font-light mb-8">
        {service.desc}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {service.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 border border-white/7 font-mono text-[0.6rem] tracking-wide uppercase text-dim"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <Link
        href={service.href}
        className="inline-flex items-center gap-2 font-mono text-[0.68rem] tracking-[2px] uppercase transition-colors duration-200"
        style={{ color: service.color }}
      >
        Learn More
        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </Link>

      {/* Large background number */}
      <div
        className="absolute bottom-[-10px] right-4 font-display font-bold text-[5rem] leading-none pointer-events-none select-none"
        style={{ color: 'rgba(255,255,255,0.025)' }}
        aria-hidden="true"
      >
        {service.id}
      </div>
    </motion.div>
  )
}

// ── Main Section ──
export function ServicesSection() {
  const headRef      = useRef<HTMLDivElement>(null)
  const headInView   = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section id="services" className="py-[120px]">
      <div className="section-container">
        {/* Header */}
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="eyebrow mb-5">Our Services</div>
          <h2
            className="font-display font-bold text-ivory mb-5"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: '1.0', letterSpacing: '-2px' }}
          >
            Everything<br />Entertainment.<br />One Roof.
          </h2>
          <p className="text-fog text-[1.05rem] leading-[1.75] font-light max-w-[520px]">
            From a single screen in a small town to a subscriber in a metro — Infllax powers the full journey of content, advertising, and distribution.
          </p>
        </motion.div>
      </div>

      {/* Services Grid — full-width with internal border */}
      <div
        className="max-w-7xl mx-auto px-14 grid grid-cols-1 md:grid-cols-2 border-t border-l border-white/7"
      >
        {SERVICES.map((service, i) => (
          <ServiceCard key={service.id} service={service} index={i} />
        ))}
      </div>
    </section>
  )
}
