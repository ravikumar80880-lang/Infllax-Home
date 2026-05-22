// ═══════════════════════════════════════════════
// INFLLAX — Utility Functions
// File: src/lib/utils.ts
// ═══════════════════════════════════════════════

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes safely.
 * Combines clsx + tailwind-merge to avoid class conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with Indian locale (e.g. 5000 → 5,000)
 */
export function formatIndianNumber(num: number): string {
  return num.toLocaleString('en-IN')
}

/**
 * Animate counter from 0 to target value
 */
export function animateCounter(
  element: HTMLElement,
  target: number,
  suffix: string = '',
  duration: number = 1800
): void {
  const startTime = performance.now()

  const tick = (now: number) => {
    const elapsed  = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased    = 1 - Math.pow(1 - progress, 4)
    const current  = Math.floor(eased * target)

    element.textContent = target >= 1000
      ? formatIndianNumber(current) + (target === 5000 ? '+' : '') + suffix
      : current + suffix

    if (progress < 1) {
      requestAnimationFrame(tick)
    } else {
      element.textContent = target >= 1000
        ? formatIndianNumber(target) + (target === 5000 ? '+' : '') + suffix
        : target + suffix
    }
  }

  requestAnimationFrame(tick)
}

/**
 * Debounce function for search inputs (used in Browse page)
 * Matches PDF: "Live search with debounce"
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Stagger animation delay for child elements
 */
export function staggerDelay(index: number, base: number = 100): string {
  return `${index * base}ms`
}
