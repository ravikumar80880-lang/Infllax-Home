'use client'
// ═══════════════════════════════════════════════
// INFLLAX — Contact Section
// File: src/components/sections/ContactSection.tsx
// Stack: Next.js | React Hook Form | Tailwind CSS
// Note: In production, form submission connects to
//       Node.js + Express API (as per PDF stack)
// ═══════════════════════════════════════════════

import { useState, useRef, FormEvent } from 'react'
import { motion, useInView } from 'framer-motion'
import { PARTNER_TYPES } from '@/lib/constants'

// ── Form State Type ──
interface FormState {
  name:        string
  email:       string
  phone:       string
  company:     string
  partnerType: string
  city:        string
  message:     string
}

// ── Input Component ──
function FormInput({
  label, type = 'text', placeholder, value, onChange, required,
}: {
  label:       string
  type?:       string
  placeholder: string
  value:       string
  onChange:    (v: string) => void
  required?:   boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[0.6rem] tracking-[2px] uppercase text-dim">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 bg-white/4 border border-white/7 text-ivory text-[0.875rem] font-body outline-none transition-colors duration-200 placeholder:text-dim focus:border-saffron"
      />
    </div>
  )
}

// ── Contact Info Row ──
function ContactRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 pb-6 border-b border-white/5 last:border-b-0 last:pb-0">
      <div className="w-10 h-10 border border-white/7 flex items-center justify-center text-lg flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-mono text-[0.6rem] tracking-[2px] uppercase text-dim mb-1">{label}</p>
        <p className="text-ivory text-[0.9rem]">{value}</p>
      </div>
    </div>
  )
}

// ── Main Component ──
export function ContactSection() {
  const ref      = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', company: '',
    partnerType: '', city: '', message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)

  const update = (field: keyof FormState) => (v: string) =>
    setForm((prev) => ({ ...prev, [field]: v }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    /**
     * TODO (Production): POST to Node.js + Express API
     * POST /api/contact
     * Body: form data
     * The API connects to MySQL (users DB from PDF)
     * and sends confirmation email via SMTP
     */
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)

    setTimeout(() => {
      setSubmitted(false)
      setForm({ name: '', email: '', phone: '', company: '', partnerType: '', city: '', message: '' })
    }, 4000)
  }

  return (
    <section id="contact" className="py-[120px]">
      {/* Section Header */}
      <div className="section-container mb-14">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="eyebrow mb-5">Get In Touch</div>
          <h2
            className="font-display font-bold text-ivory"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: '1.0', letterSpacing: '-2px' }}
          >
            Partner With<br />Infllax.
          </h2>
        </motion.div>
      </div>

      {/* Split Panel */}
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 border border-white/7">

          {/* ── FORM COLUMN ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-14 border-b lg:border-b-0 lg:border-r border-white/7"
            style={{ padding: '64px 56px' }}
          >
            <p className="font-mono text-[0.65rem] tracking-[2.5px] uppercase text-saffron mb-5">
              Send Us a Message
            </p>
            <h3
              className="font-display font-bold text-ivory mb-3"
              style={{ fontSize: '1.9rem', letterSpacing: '-1px', lineHeight: '1.1' }}
            >
              Ready to join<br />the network?
            </h3>
            <p className="text-fog text-[0.88rem] leading-[1.75] mb-9">
              Fill in your details and our team will get back to you within 24 hours — whether you want to advertise, distribute content, list your theater, or explore an investment.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="Full Name"     placeholder="Your full name"     value={form.name}    onChange={update('name')}    required />
                <FormInput label="Email Address" type="email" placeholder="your@email.com" value={form.email}   onChange={update('email')}   required />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="Mobile Number" type="tel" placeholder="+91 98000 00000" value={form.phone}   onChange={update('phone')}   required />
                <FormInput label="Company / Organisation" placeholder="Optional"        value={form.company} onChange={update('company')} />
              </div>

              {/* Partner Type */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[0.6rem] tracking-[2px] uppercase text-dim">
                  I Am A *
                </label>
                <select
                  value={form.partnerType}
                  onChange={(e) => update('partnerType')(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/4 border border-white/7 text-fog text-[0.875rem] font-body outline-none cursor-pointer appearance-none transition-colors duration-200 focus:border-teal"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <option value="" disabled>Select your role</option>
                  {PARTNER_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value} style={{ background: '#0b1828' }}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <FormInput label="City / State" placeholder="e.g. Mumbai, Maharashtra" value={form.city} onChange={update('city')} />

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[0.6rem] tracking-[2px] uppercase text-dim">
                  Your Requirement
                </label>
                <textarea
                  placeholder="Tell us about your requirement..."
                  value={form.message}
                  onChange={(e) => update('message')(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/4 border border-white/7 text-ivory text-[0.875rem] font-body outline-none resize-none transition-colors duration-200 placeholder:text-dim focus:border-saffron"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || submitted}
                className="w-full py-4 font-body font-bold text-[0.9rem] tracking-wide transition-all duration-200 disabled:opacity-70"
                style={{
                  background:  submitted ? '#00c2a8' : '#ff6b1a',
                  color:       '#04080f',
                  cursor:      loading || submitted ? 'not-allowed' : 'pointer',
                }}
              >
                {loading   ? 'Submitting...'
                : submitted ? '✓ Inquiry Submitted — We\'ll be in touch!'
                : 'Submit Inquiry →'}
              </button>
            </form>
          </motion.div>

          {/* ── CONTACT INFO COLUMN ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ padding: '64px 56px' }}
          >
            <p className="font-mono text-[0.65rem] tracking-[2.5px] uppercase text-teal mb-5">
              Direct Contact
            </p>
            <h3
              className="font-display font-bold text-ivory mb-3"
              style={{ fontSize: '1.9rem', letterSpacing: '-1px', lineHeight: '1.1' }}
            >
              Let's talk<br />business.
            </h3>
            <p className="text-fog text-[0.88rem] leading-[1.75] mb-10">
              Our partnership team is available Monday to Saturday, 10 AM to 7 PM IST.
            </p>

            {/* Contact rows */}
            <div className="flex flex-col gap-6 mb-10">
              <ContactRow icon="✉️" label="Email — General"      value="hello@infllax.com"    />
              <ContactRow icon="🤝" label="Email — Partnerships" value="partners@infllax.com" />
              <ContactRow icon="📞" label="Phone — Business"     value="+91 98000 00000"      />
              <ContactRow icon="🏢" label="Registered Office"    value="India — Pan-India Operations" />
            </div>

            {/* Theater CTA */}
            <div
              className="p-7 border"
              style={{ background: 'rgba(255,107,26,0.06)', borderColor: 'rgba(255,107,26,0.2)' }}
            >
              <p className="font-mono text-[0.62rem] tracking-[2px] uppercase text-saffron mb-2.5">
                Theater Owners
              </p>
              <p className="text-fog text-[0.85rem] leading-[1.7]">
                If you own or manage a single-screen or multiplex and want to join our advertising network — reach out to our dedicated theater onboarding team at{' '}
                <strong className="text-ivory">theaters@infllax.com</strong>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
