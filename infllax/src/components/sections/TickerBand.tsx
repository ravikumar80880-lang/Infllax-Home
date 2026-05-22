'use client'
// ═══════════════════════════════════════════════
// INFLLAX — Ticker Band Component
// File: src/components/sections/TickerBand.tsx
// Stack: RxJS (as per PDF) | React | Tailwind CSS
// RxJS: Used for real-time stream simulation
//       In production: connects to live platform data
// ═══════════════════════════════════════════════

import { useEffect, useRef } from 'react'
import { interval, Subject, takeUntil } from 'rxjs'
import { TICKER_ITEMS } from '@/lib/constants'

// Duplicate items for seamless loop
const ITEMS_DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS]

export function TickerBand() {
  const destroyRef = useRef(new Subject<void>())

  useEffect(() => {
    /**
     * RxJS interval stream — as specified in PDF tech stack.
     * In production this would pipe real-time platform data:
     * new theater onboards, active campaigns count, etc.
     * Currently used to demonstrate RxJS integration.
     */
    const ticker$ = interval(5000).pipe(
      takeUntil(destroyRef.current)
    )

    const sub = ticker$.subscribe(() => {
      // Future: emit live platform stats into ticker
      // e.g. "3 new theaters joined today"
    })

    return () => {
      destroyRef.current.next()
      destroyRef.current.complete()
      sub.unsubscribe()
    }
  }, [])

  return (
    <div
      className="overflow-hidden py-[14px] relative z-10"
      style={{ background: '#ff6b1a' }}
      aria-hidden="true"
    >
      <div className="flex animate-ticker whitespace-nowrap">
        {ITEMS_DOUBLED.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 px-8 font-display font-semibold text-[0.8rem] tracking-[1.5px] uppercase text-ink flex-shrink-0"
          >
            {item}
            <span className="text-black/25 text-lg">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
