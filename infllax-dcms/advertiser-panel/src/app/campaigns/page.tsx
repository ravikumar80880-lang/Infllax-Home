'use client'
// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Advertiser Campaign Dashboard
// File: advertiser-panel/src/app/campaigns/page.tsx
// Stack: Next.js 14 | Razorpay | RxJS | Recharts | Socket.io
// Connects to: dcms-backend port 5000
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef }        from 'react'
import { motion, AnimatePresence }             from 'framer-motion'
import { interval, Subject, takeUntil }        from 'rxjs'
import { io as socketIO }                      from 'socket.io-client'
import {
  LayoutDashboard, Megaphone, PlusCircle, BarChart3,
  CreditCard, Upload, Play, Pause, CheckCircle,
  Clock, XCircle, IndianRupee, Eye, MapPin,
  LogOut, Bell, ChevronRight, Tv, Globe,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell,
} from 'recharts'
import { CampaignAPI, UploadAPI, AuthAPI, CORPORATE_SITE_URL, THEATER_PORTAL_URL } from '../lib/api'

// ── Types ──
interface Campaign {
  id: string; name: string; status: string; budget_total: number;
  spent_amount: number; impressions: number; start_date: string;
  end_date: string; format: string; video_url: string;
}

// ── Status Badge ──
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    draft:           { color: '#7a90a8', bg: 'rgba(122,144,168,0.1)', label: 'Draft'           },
    pending_payment: { color: '#ff6b1a', bg: 'rgba(255,107,26,0.1)',  label: 'Pending Payment' },
    active:          { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  label: 'Active'          },
    paused:          { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'Paused'          },
    completed:       { color: '#00c2a8', bg: 'rgba(0,194,168,0.1)',   label: 'Completed'       },
    rejected:        { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Rejected'        },
  }
  const s = map[status] || map.draft
  return (
    <span style={{ padding: '3px 10px', background: s.bg, color: s.color, fontSize: '0.62rem', fontFamily: 'monospace', letterSpacing: 1, textTransform: 'uppercase' }}>
      {s.label}
    </span>
  )
}

// ── Nav Items ──
const NAV = [
  { icon: LayoutDashboard, label: 'Overview',        id: 'overview'  },
  { icon: Megaphone,       label: 'My Campaigns',    id: 'campaigns' },
  { icon: PlusCircle,      label: 'Create Campaign', id: 'create'    },
  { icon: BarChart3,       label: 'Analytics',       id: 'analytics' },
  { icon: CreditCard,      label: 'Billing',         id: 'billing'   },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function AdvertiserDashboard() {
  const [tab,       setTab]       = useState('overview')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selected,  setSelected]  = useState<Campaign | null>(null)
  const [liveTime,  setLiveTime]  = useState('')
  const [notifs,    setNotifs]    = useState(2)
  const destroyRef = useRef(new Subject<void>())

  // ── RxJS live clock ──
  useEffect(() => {
    const clock$ = interval(1000).pipe(takeUntil(destroyRef.current))
    clock$.subscribe(() => setLiveTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })))
    return () => { destroyRef.current.next(); destroyRef.current.complete() }
  }, [])

  // ── Socket.io — real-time campaign status ──
  useEffect(() => {
    const socket = socketIO(API_URL)
    socket.on('campaign:approved', (d: any) => {
      setNotifs(p => p + 1)
      setCampaigns(prev => prev.map(c => c.id === d.campaignId ? { ...c, status: 'active' } : c))
    })
    return () => { socket.disconnect() }
  }, [])

  // ── Load campaigns ──
  useEffect(() => {
    CampaignAPI.getAll()
      .then((d: any) => { if (d.campaigns) setCampaigns(d.campaigns) })
      .catch(console.error)
  }, [])

  const totalBudget    = campaigns.reduce((s, c) => s + Number(c.budget_total), 0)
  const totalSpent     = campaigns.reduce((s, c) => s + Number(c.spent_amount), 0)
  const totalImpress   = campaigns.reduce((s, c) => s + Number(c.impressions), 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length

  return (
    <div className="min-h-screen flex" style={{ background: '#04080f', color: '#f5f0e8' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 240, flexShrink: 0, background: '#070e1a', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column' }}>
        {/* Logo — links back to corporate site */}
        <a href={CORPORATE_SITE_URL} style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none' }}>
          <span style={{ fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg,#ff6b1a,#00c2a8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Infllax</span>
          <span style={{ fontSize: '0.55rem', marginLeft: 8, color: '#3d5570', fontFamily: 'monospace', letterSpacing: 1 }}>ADVERTISER</span>
        </a>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => {
            const active = tab === item.id
            return (
              <button key={item.id} onClick={() => setTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: active ? 'rgba(255,107,26,0.1)' : 'transparent', borderLeft: active ? '2px solid #ff6b1a' : '2px solid transparent', color: active ? '#ff6b1a' : '#7a90a8', fontSize: '0.875rem', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}>
                <item.icon size={15} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Links to other portals */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: '0.6rem', color: '#3d5570', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 10, textTransform: 'uppercase' }}>Other Portals</p>
          <a href={THEATER_PORTAL_URL} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7a90a8', fontSize: '0.78rem', textDecoration: 'none', padding: '6px 0' }}>
            <Tv size={13} /> Theater Portal
          </a>
          <a href={CORPORATE_SITE_URL} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7a90a8', fontSize: '0.78rem', textDecoration: 'none', padding: '6px 0' }}>
            <Globe size={13} /> Infllax.com
          </a>
          <button onClick={AuthAPI.logout} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7a90a8', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', marginTop: 4 }}>
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Top Bar */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#04080f', position: 'sticky', top: 0, zIndex: 10 }}>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f5f0e8' }}>
            {NAV.find(n => n.id === tab)?.label}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#7a90a8' }}>{liveTime}</span>
            <div style={{ position: 'relative' }}>
              <Bell size={17} color="#7a90a8" />
              {notifs > 0 && <span style={{ position: 'absolute', top: -6, right: -6, width: 15, height: 15, borderRadius: '50%', background: '#ff6b1a', color: '#04080f', fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{notifs}</span>}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: 32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
                {[
                  { label: 'Active Campaigns', value: activeCampaigns,              color: '#4ade80', icon: Play       },
                  { label: 'Total Budget (₹)',  value: `₹${totalBudget.toFixed(0)}`,color: '#ff6b1a', icon: IndianRupee },
                  { label: 'Amount Spent (₹)',  value: `₹${totalSpent.toFixed(0)}`, color: '#a78bfa', icon: CreditCard  },
                  { label: 'Total Impressions', value: totalImpress.toLocaleString('en-IN'), color: '#00c2a8', icon: Eye },
                ].map(s => (
                  <div key={s.label} style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: '24px 20px' }}>
                    <s.icon size={18} color={s.color} style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.72rem', color: '#7a90a8', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent campaigns */}
              <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f5f0e8' }}>Recent Campaigns</h3>
                  <button onClick={() => setTab('create')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ff6b1a', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <PlusCircle size={14} /> New Campaign
                  </button>
                </div>
                {campaigns.slice(0, 5).map(c => (
                  <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} onClick={() => { setSelected(c); setTab('analytics') }}>
                    <span style={{ fontSize: '0.875rem', color: '#f5f0e8' }}>{c.name}</span>
                    <StatusBadge status={c.status} />
                    <span style={{ fontSize: '0.8rem', color: '#7a90a8' }}>₹{Number(c.budget_total).toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '0.75rem', color: '#3d5570', fontFamily: 'monospace' }}>{Number(c.impressions).toLocaleString()}</span>
                  </div>
                ))}
                {campaigns.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <p style={{ color: '#3d5570', fontSize: '0.875rem', marginBottom: 16 }}>No campaigns yet</p>
                    <button onClick={() => setTab('create')} style={{ padding: '10px 24px', background: '#ff6b1a', color: '#04080f', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Create First Campaign →</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── CAMPAIGNS LIST ── */}
          {tab === 'campaigns' && (
            <motion.div key="campaigns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button onClick={() => setTab('create')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#ff6b1a', color: '#04080f', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <PlusCircle size={15} /> Create Campaign
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {campaigns.map(c => (
                  <div key={c.id} style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px 100px 100px', gap: 16, alignItems: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onClick={() => { setSelected(c); setTab('analytics') }}>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f5f0e8', marginBottom: 4 }}>{c.name}</p>
                      <p style={{ fontSize: '0.7rem', color: '#3d5570', fontFamily: 'monospace' }}>{c.start_date} → {c.end_date}</p>
                    </div>
                    <StatusBadge status={c.status} />
                    <div>
                      <p style={{ fontSize: '0.65rem', color: '#3d5570', marginBottom: 2 }}>Budget</p>
                      <p style={{ fontSize: '0.875rem', color: '#f5f0e8' }}>₹{Number(c.budget_total).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: '#3d5570', marginBottom: 2 }}>Spent</p>
                      <p style={{ fontSize: '0.875rem', color: '#ff6b1a' }}>₹{Number(c.spent_amount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: '#3d5570', marginBottom: 2 }}>Impressions</p>
                      <p style={{ fontSize: '0.875rem', color: '#00c2a8' }}>{Number(c.impressions).toLocaleString()}</p>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#3d5570', fontFamily: 'monospace', textTransform: 'uppercase' }}>{c.format}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── CREATE CAMPAIGN ── */}
          {tab === 'create' && (
            <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 32 }}>
              <CreateCampaignForm onCreated={() => { CampaignAPI.getAll().then((d: any) => setCampaigns(d.campaigns || [])); setTab('campaigns') }} />
            </motion.div>
          )}

          {/* ── ANALYTICS ── */}
          {tab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 32 }}>
              <AnalyticsPanel campaigns={campaigns} selected={selected} />
            </motion.div>
          )}

          {/* ── BILLING ── */}
          {tab === 'billing' && (
            <motion.div key="billing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 32 }}>
              <BillingPanel campaigns={campaigns} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}

// ══════════════════════════════════════════
// CREATE CAMPAIGN FORM
// Stack: Next.js form → Node.js API → MySQL
//        Razorpay for payment (as per PDF)
// ══════════════════════════════════════════
function CreateCampaignForm({ onCreated }: { onCreated: () => void }) {
  const [step,     setStep]     = useState(1)
  const [loading,  setLoading]  = useState(false)
  const [campaignId, setCampaignId] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [form,     setForm]     = useState({
    name: '', description: '', format: 'pre_show',
    budget_total: '', budget_daily: '',
    start_date: '', end_date: '',
    target_cities: '', target_states: '',
    duration_sec: 30,
  })

  const update = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }))

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f5f0e8', fontSize: '0.875rem', outline: 'none', marginBottom: 14 }
  const labelStyle: React.CSSProperties = { fontSize: '0.62rem', fontFamily: 'monospace', letterSpacing: 2, textTransform: 'uppercase', color: '#3d5570', display: 'block', marginBottom: 5 }

  // Step 1 — Campaign Details
  const submitDetails = async () => {
    setLoading(true)
    try {
      const res: any = await CampaignAPI.create({
        ...form,
        budget_total:   parseFloat(form.budget_total),
        budget_daily:   parseFloat(form.budget_daily) || null,
        target_cities:  form.target_cities.split(',').map(s => s.trim()).filter(Boolean),
        target_states:  form.target_states.split(',').map(s => s.trim()).filter(Boolean),
      })
      setCampaignId(res.campaignId)
      setStep(2)
    } catch (e: any) { alert(e.message) }
    finally { setLoading(false) }
  }

  // Step 2 — Upload Video to AWS S3
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const res = await UploadAPI.uploadVideo(file, campaignId)
      setVideoUrl(res.url)
      alert('✓ Video uploaded to AWS S3 via CloudFront CDN')
    } catch (err: any) { alert('Upload failed: ' + err.message) }
    finally { setLoading(false) }
  }

  // Step 3 — Razorpay Payment (as per PDF)
  const handlePayment = async () => {
    setLoading(true)
    try {
      const order: any = await CampaignAPI.initPayment(campaignId)

      // Load Razorpay script
      const script = document.createElement('script')
      script.src   = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)

      script.onload = () => {
        const rzp = new (window as any).Razorpay({
          key:         order.key,
          amount:      order.order.amount,
          currency:    'INR',
          name:        'Infllax DCMS',
          description: `Campaign: ${form.name}`,
          order_id:    order.order.id,
          handler:     async (response: any) => {
            await CampaignAPI.verifyPayment(campaignId, response)
            alert('✓ Payment successful! Campaign submitted for review.')
            onCreated()
          },
          prefill:    { name: '', email: '', contact: '' },
          theme:      { color: '#ff6b1a' },
        })
        rzp.open()
      }
    } catch (e: any) { alert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
        {['Campaign Details', 'Upload Ad Video', 'Payment'].map((s, i) => (
          <div key={s} style={{ flex: 1, padding: '12px 16px', background: step === i + 1 ? '#ff6b1a' : step > i + 1 ? 'rgba(255,107,26,0.15)' : '#0f2035', color: step === i + 1 ? '#04080f' : step > i + 1 ? '#ff6b1a' : '#3d5570', fontSize: '0.78rem', fontFamily: 'monospace', letterSpacing: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none', fontWeight: step === i + 1 ? 700 : 400 }}>
            {i + 1}. {s}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 32 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f5f0e8', marginBottom: 24 }}>Campaign Details</h3>
          <label style={labelStyle}>Campaign Name *</label>
          <input style={inputStyle} placeholder="e.g. Diwali Sale — Mumbai" value={form.name} onChange={update('name')} />
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, resize: 'none', height: 80 }} placeholder="What is this campaign about?" value={form.description} onChange={update('description')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Ad Format</label>
              <select style={{ ...inputStyle, background: '#0b1828', color: '#7a90a8' }} value={form.format} onChange={update('format')}>
                <option value="pre_show">Pre-Show</option>
                <option value="interval">Interval Ad</option>
                <option value="lobby">Lobby Screen</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Duration (seconds)</label>
              <select style={{ ...inputStyle, background: '#0b1828', color: '#7a90a8' }} value={form.duration_sec} onChange={e => setForm(p => ({ ...p, duration_sec: parseInt(e.target.value) }))}>
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={45}>45 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Total Budget (₹) *</label>
              <input style={inputStyle} type="number" placeholder="e.g. 50000" value={form.budget_total} onChange={update('budget_total')} />
            </div>
            <div>
              <label style={labelStyle}>Daily Budget Cap (₹)</label>
              <input style={inputStyle} type="number" placeholder="Optional" value={form.budget_daily} onChange={update('budget_daily')} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Start Date *</label>
              <input style={inputStyle} type="date" value={form.start_date} onChange={update('start_date')} />
            </div>
            <div>
              <label style={labelStyle}>End Date *</label>
              <input style={inputStyle} type="date" value={form.end_date} onChange={update('end_date')} />
            </div>
          </div>
          <label style={labelStyle}>Target Cities (comma separated)</label>
          <input style={inputStyle} placeholder="e.g. Mumbai, Delhi, Bangalore" value={form.target_cities} onChange={update('target_cities')} />
          <label style={labelStyle}>Target States (comma separated)</label>
          <input style={inputStyle} placeholder="e.g. Maharashtra, Delhi, Karnataka" value={form.target_states} onChange={update('target_states')} />
          <button onClick={submitDetails} disabled={loading || !form.name || !form.budget_total || !form.start_date || !form.end_date} style={{ width: '100%', padding: 14, background: '#ff6b1a', color: '#04080f', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : 'Continue to Video Upload →'}
          </button>
        </div>
      )}

      {/* Step 2 — Upload to AWS S3 */}
      {step === 2 && (
        <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 32 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f5f0e8', marginBottom: 8 }}>Upload Ad Video</h3>
          <p style={{ fontSize: '0.82rem', color: '#7a90a8', marginBottom: 28 }}>Upload MP4 file. Max 200MB. Delivered via AWS S3 + CloudFront CDN to all theater screens.</p>
          <div style={{ border: '2px dashed rgba(255,107,26,0.3)', padding: '48px 32px', textAlign: 'center', marginBottom: 20 }}>
            <Upload size={32} color="#ff6b1a" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#f5f0e8', marginBottom: 8 }}>Drag & Drop your MP4 file here</p>
            <p style={{ color: '#3d5570', fontSize: '0.8rem', marginBottom: 20 }}>or click to browse</p>
            <input type="file" accept="video/mp4,video/webm" onChange={handleVideoUpload} style={{ display: 'none' }} id="vidUpload" />
            <label htmlFor="vidUpload" style={{ padding: '10px 28px', background: '#ff6b1a', color: '#04080f', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
              {loading ? 'Uploading to S3...' : 'Choose File'}
            </label>
          </div>
          {videoUrl && (
            <div style={{ padding: '12px 16px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', marginBottom: 20 }}>
              <p style={{ color: '#4ade80', fontSize: '0.82rem' }}>✓ Video uploaded to AWS CloudFront CDN</p>
              <p style={{ color: '#3d5570', fontSize: '0.68rem', fontFamily: 'monospace', marginTop: 4, wordBreak: 'break-all' }}>{videoUrl}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#7a90a8', cursor: 'pointer' }}>← Back</button>
            <button onClick={() => setStep(3)} disabled={!videoUrl} style={{ flex: 2, padding: 12, background: videoUrl ? '#ff6b1a' : '#0f2035', color: videoUrl ? '#04080f' : '#3d5570', fontWeight: 700, border: 'none', cursor: videoUrl ? 'pointer' : 'not-allowed', fontSize: '0.9rem' }}>
              Continue to Payment →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Razorpay */}
      {step === 3 && (
        <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 32 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f5f0e8', marginBottom: 24 }}>Campaign Summary & Payment</h3>
          {[
            ['Campaign Name', form.name],
            ['Ad Format',     form.format.replace('_', ' ').toUpperCase()],
            ['Duration',      `${form.duration_sec} seconds`],
            ['Start Date',    form.start_date],
            ['End Date',      form.end_date],
            ['Total Budget',  `₹${parseFloat(form.budget_total).toLocaleString('en-IN')}`],
            ['GST (18%)',     `₹${(parseFloat(form.budget_total) * 0.18).toFixed(2)}`],
            ['Grand Total',   `₹${(parseFloat(form.budget_total) * 1.18).toFixed(2)}`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.82rem', color: '#7a90a8' }}>{k}</span>
              <span style={{ fontSize: '0.85rem', color: k === 'Grand Total' ? '#ff6b1a' : '#f5f0e8', fontWeight: k === 'Grand Total' ? 700 : 400 }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 28, padding: '14px 16px', background: 'rgba(255,107,26,0.06)', border: '1px solid rgba(255,107,26,0.2)', marginBottom: 24 }}>
            <p style={{ fontSize: '0.78rem', color: '#7a90a8' }}>Payment via <strong style={{ color: '#f5f0e8' }}>Razorpay</strong> — UPI, Debit/Credit Card, Net Banking, Wallets accepted.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#7a90a8', cursor: 'pointer' }}>← Back</button>
            <button onClick={handlePayment} disabled={loading} style={{ flex: 2, padding: 14, background: '#ff6b1a', color: '#04080f', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>
              {loading ? 'Opening Razorpay...' : `Pay ₹${(parseFloat(form.budget_total) * 1.18).toFixed(0)} →`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════
// ANALYTICS PANEL
// ══════════════════════════════════════════
function AnalyticsPanel({ campaigns, selected }: { campaigns: Campaign[]; selected: Campaign | null }) {
  const [data,    setData]    = useState<any>(null)
  const [current, setCurrent] = useState<Campaign | null>(selected || campaigns[0] || null)

  useEffect(() => {
    if (!current) return
    CampaignAPI.getAnalytics(current.id)
      .then((d: any) => setData(d))
      .catch(console.error)
  }, [current])

  if (!campaigns.length) return <p style={{ color: '#3d5570', padding: 40, textAlign: 'center' }}>No campaigns to analyze yet.</p>

  return (
    <div>
      {/* Campaign selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {campaigns.map(c => (
          <button key={c.id} onClick={() => setCurrent(c)} style={{ padding: '8px 16px', background: current?.id === c.id ? '#ff6b1a' : '#0f2035', color: current?.id === c.id ? '#04080f' : '#7a90a8', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: current?.id === c.id ? 700 : 400 }}>
            {c.name}
          </button>
        ))}
      </div>

      {data && (
        <>
          {/* Totals */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Plays',       value: data.totals?.total_plays || 0,       color: '#ff6b1a' },
              { label: 'Theaters Reached',  value: data.totals?.theaters_reached || 0,  color: '#00c2a8' },
              { label: 'Total Air Time',    value: `${Math.round((data.totals?.total_duration_sec || 0) / 60)} min`, color: '#a78bfa' },
            ].map(s => (
              <div key={s.label} style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: '24px 20px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#7a90a8', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Daily plays chart */}
          <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f5f0e8', marginBottom: 20 }}>Daily Plays</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={[...(data.daily || [])].reverse()}>
                <defs>
                  <linearGradient id="playsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00c2a8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00c2a8" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#7a90a8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#7a90a8', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0b1828', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f0e8' }} />
                <Area type="monotone" dataKey="plays" stroke="#00c2a8" fill="url(#playsGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* By theater */}
          <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 24 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f5f0e8', marginBottom: 16 }}>Plays by Theater</h3>
            {(data.byTheater || []).map((t: any) => (
              <div key={t.theater_name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <MapPin size={13} color="#7a90a8" />
                <span style={{ flex: 1, fontSize: '0.85rem', color: '#f5f0e8' }}>{t.theater_name}</span>
                <span style={{ fontSize: '0.75rem', color: '#7a90a8' }}>{t.city}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ff6b1a' }}>{t.plays} plays</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ══════════════════════════════════════════
// BILLING PANEL
// ══════════════════════════════════════════
function BillingPanel({ campaigns }: { campaigns: Campaign[] }) {
  const paid    = campaigns.filter(c => ['active','completed'].includes(c.status))
  const pending = campaigns.filter(c => c.status === 'pending_payment')

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 24 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f5f0e8', marginBottom: 16 }}>Paid Campaigns</h3>
          {paid.length === 0 && <p style={{ color: '#3d5570', fontSize: '0.82rem' }}>No paid campaigns yet</p>}
          {paid.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.85rem', color: '#f5f0e8' }}>{c.name}</span>
              <span style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 600 }}>₹{Number(c.budget_total).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 24 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f5f0e8', marginBottom: 16 }}>Pending Payments</h3>
          {pending.length === 0 && <p style={{ color: '#3d5570', fontSize: '0.82rem' }}>No pending payments</p>}
          {pending.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.85rem', color: '#f5f0e8' }}>{c.name}</span>
              <span style={{ fontSize: '0.85rem', color: '#ff6b1a', fontWeight: 600 }}>₹{Number(c.budget_total).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'rgba(255,107,26,0.06)', border: '1px solid rgba(255,107,26,0.2)', padding: 20 }}>
        <p style={{ fontSize: '0.82rem', color: '#7a90a8' }}>
          All payments processed via <strong style={{ color: '#f5f0e8' }}>Razorpay</strong> — UPI, Debit/Credit Cards, Net Banking, Wallets.
          GST invoices auto-generated and emailed as per PDF spec.
        </p>
      </div>
    </div>
  )
}
