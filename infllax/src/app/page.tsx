// ═══════════════════════════════════════════════
// INFLLAX — Home Page
// File: src/app/page.tsx
// Stack: Next.js 14 | React 18 | TypeScript
// ═══════════════════════════════════════════════

import { Navbar }          from '@/components/layout/Navbar'
import { Footer }          from '@/components/layout/Footer'
import { HeroSection }     from '@/components/sections/HeroSection'
import { TickerBand }      from '@/components/sections/TickerBand'
import { TrustNumbers }    from '@/components/sections/TrustNumbers'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { AudienceSection } from '@/components/sections/AudienceSection'
import { WhySection }      from '@/components/sections/WhySection'
import { HowItWorks }      from '@/components/sections/HowItWorks'
import { TechStrip }       from '@/components/sections/TechStrip'
import { CtaBand }         from '@/components/sections/CtaBand'
import { ContactSection }  from '@/components/sections/ContactSection'

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ── HERO ── */}
        <HeroSection />

        {/* ── TICKER ── */}
        <TickerBand />

        {/* ── TRUST NUMBERS ── */}
        <TrustNumbers />

        {/* ── SERVICES ── */}
        <ServicesSection />

        {/* ── WHO WE SERVE ── */}
        <AudienceSection />

        {/* ── WHY INFLLAX ── */}
        <WhySection />

        {/* ── HOW IT WORKS ── */}
        <HowItWorks />

        {/* ── TECH STACK STRIP ── */}
        <TechStrip />

        {/* ── CTA BAND ── */}
        <CtaBand />

        {/* ── CONTACT & PARTNER FORM ── */}
        <ContactSection />
      </main>

      <Footer />
    </>
  )
}
