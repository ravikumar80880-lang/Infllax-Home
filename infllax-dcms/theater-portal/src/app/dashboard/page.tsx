'use client'
// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Theater Owner Dashboard
// File: theater-portal/src/app/dashboard/page.tsx
// Stack: Next.js 14 | Tailwind CSS | Framer Motion
//        RxJS (real-time) | Socket.io | Recharts
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence }     from 'framer-motion'
import { Subject, interval, takeUntil } from 'rxjs'
import { io as socketIO }               from 'socket.io-client'
import {
  LayoutDashboard, Monitor, Calendar, IndianRupee,
  CreditCard, HelpCircle, LogOut, Bell, Wifi, WifiOff,
  TrendingUp, Play, Clock, ChevronRight, Plus
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'

// ── API Base ──
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// ── Types ──
interface Theater   { id: string; name: string; city: string; status: string; total_screens: number }
interface Schedule  { schedule_id: string; time_slot: string; campaign_name: string; duration_sec: number; show_type: string }
interface Revenue   { total_earned: number; total_plays: number; pending_payout: number }
interface MonthData { month: string; earned: number; plays: number }

// ── Sidebar Nav ──
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',  id: 'dashboard'  },
  { icon: Monitor,         label: 'My Screens', id: 'screens'    },
  { icon: Calendar,        label: 'Today\'s Schedule', id: 'schedule' },
  { icon: IndianRupee,     label: 'Revenue',    id: 'revenue'    },
  { icon: CreditCard,      label: 'Payments',   id: 'payments'   },
  { icon: HelpCircle,      label: 'Support',    id: 'support'    },
]

export default function TheaterDashboard() {
  const [activeTab,  setActiveTab]  = useState('dashboard')
  const [theater,    setTheater]    = useState<Theater | null>(null)
  const [schedule,   setSchedule]   = useState<Schedule[]>([])
  const [revenue,    setRevenue]    = useState<Revenue | null>(null)
  const [monthly,    setMonthly]    = useState<MonthData[]>([])
  const [isOnline,   setIsOnline]   = useState(true)
  const [liveTime,   setLiveTime]   = useState('')
  const [notifCount, setNotifCount] = useState(3)

  const destroyRef = useRef(new Subject<void>())
  const token      = typeof window !== 'undefined' ? localStorage.getItem('theater_token') : null

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  // ── RxJS: Live clock (as per PDF RxJS real-time layer) ──
  useEffect(() => {
    const clock$ = interval(1000).pipe(takeUntil(destroyRef.current))
    clock$.subscribe(() => {
      setLiveTime(new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      }))
    })
    return () => { destroyRef.current.next(); destroyRef.current.complete() }
  }, [])

  // ── Socket.io: Real-time updates from backend ──
  useEffect(() => {
    const socket = socketIO(API)
    socket.on('campaign:approved', () => {
      setNotifCount(p => p + 1)
      fetchSchedule()
    })
    socket.on('schedule:update', () => fetchSchedule())
    return () => { socket.disconnect() }
  }, [])

  // ── Fetch Data ──
  const fetchTheater = async () => {
    try {
      const res  = await fetch(`${API}/api/theaters/me`, { headers })
      const data = await res.json()
      if (data.success) setTheater(data.theater)
    } catch (e) { console.error(e) }
  }

  const fetchSchedule = async () => {
    try {
      const res  = await fetch(`${API}/api/theaters/schedule`, { headers })
      const data = await res.json()
      if (data.success) setSchedule(data.schedule)
    } catch (e) { console.error(e) }
  }

  const fetchRevenue = async () => {
    try {
      const res  = await fetch(`${API}/api/theaters/revenue`, { headers })
      const data = await res.json()
      if (data.success) { setRevenue(data.summary); setMonthly(data.monthly) }
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchTheater()
    fetchSchedule()
    fetchRevenue()
  }, [])

  // ── Render ──
  return (
    <div className="min-h-screen flex" style={{ background: '#04080f', color: '#f5f0e8' }}>

      {/* ── SIDEBAR ── */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#070e1a' }}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <span style={{ fontFamily: 'sans-serif', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg, #ff6b1a, #00c2a8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Infllax
          </span>
          <span style={{ fontSize: '0.6rem', marginLeft: 8, color: '#3d5570', fontFamily: 'monospace', letterSpacing: 1 }}>
            THEATER
          </span>
        </div>

        {/* Theater Info */}
        {theater && (
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: '0.75rem', color: '#7a90a8', marginBottom: 2 }}>Logged in as</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f5f0e8' }}>{theater.name}</p>
            <p style={{ fontSize: '0.72rem', color: '#7a90a8' }}>{theater.city}</p>
            <span style={{
              display: 'inline-block', marginTop: 6, padding: '2px 10px',
              background: theater.status === 'active' ? 'rgba(74,222,128,0.12)' : 'rgba(255,107,26,0.12)',
              color:      theater.status === 'active' ? '#4ade80' : '#ff6b1a',
              fontSize: '0.6rem', letterSpacing: 1, fontFamily: 'monospace', textTransform: 'uppercase',
            }}>
              {theater.status}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200"
                style={{
                  background: active ? 'rgba(255,107,26,0.1)' : 'transparent',
                  borderLeft: active ? '2px solid #ff6b1a' : '2px solid transparent',
                  color:      active ? '#ff6b1a' : '#7a90a8',
                  fontSize:   '0.875rem',
                }}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Online Status + Logout */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-3">
            {isOnline ? <Wifi size={14} color="#4ade80" /> : <WifiOff size={14} color="#ff6b1a" />}
            <span style={{ fontSize: '0.7rem', color: isOnline ? '#4ade80' : '#ff6b1a', fontFamily: 'monospace' }}>
              {isOnline ? 'Connected to Infllax' : 'Offline'}
            </span>
          </div>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
            style={{ color: '#7a90a8' }}
            onClick={() => { localStorage.clear(); window.location.href = '/login' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="h-16 flex items-center justify-between px-8 border-b sticky top-0 z-10" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#04080f' }}>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f5f0e8' }}>
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
            <p style={{ fontSize: '0.7rem', color: '#3d5570', fontFamily: 'monospace' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#7a90a8' }}>{liveTime}</span>
            <div className="relative">
              <Bell size={18} color="#7a90a8" />
              {notifCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#ff6b1a', color: '#04080f',
                  fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700,
                }}>
                  {notifCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── DASHBOARD TAB ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Today\'s Ad Slots',    value: schedule.length,                   icon: Play,         color: '#ff6b1a' },
                  { label: 'Total Screens',         value: theater?.total_screens || 0,       icon: Monitor,      color: '#00c2a8' },
                  { label: 'Total Plays (All Time)',value: revenue?.total_plays || 0,          icon: TrendingUp,   color: '#a78bfa' },
                  { label: 'Pending Payout (₹)',    value: `₹${((revenue?.pending_payout || 0)).toFixed(0)}`, icon: IndianRupee, color: '#4ade80' },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: '24px 20px' }}>
                    <stat.icon size={20} color={stat.color} style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color, letterSpacing: '-1px', lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#7a90a8', marginTop: 4 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Revenue Chart */}
              <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 28, marginBottom: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20, color: '#f5f0e8' }}>
                  Monthly Revenue (₹)
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={[...monthly].reverse()}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ff6b1a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ff6b1a" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: '#7a90a8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#7a90a8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0b1828', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f0e8' }} />
                    <Area type="monotone" dataKey="earned" stroke="#ff6b1a" fill="url(#revGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Today's Schedule Quick View */}
              <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 28 }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f5f0e8' }}>Today's Ad Schedule</h3>
                  <button onClick={() => setActiveTab('schedule')} style={{ fontSize: '0.75rem', color: '#ff6b1a', display: 'flex', alignItems: 'center', gap: 4 }}>
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                {schedule.slice(0, 5).map((s) => (
                  <div key={s.schedule_id} className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3">
                      <Clock size={14} color="#7a90a8" />
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#00c2a8' }}>{s.time_slot}</span>
                      <span style={{ fontSize: '0.85rem', color: '#f5f0e8' }}>{s.campaign_name}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#7a90a8', fontFamily: 'monospace' }}>{s.duration_sec}s</span>
                  </div>
                ))}
                {schedule.length === 0 && (
                  <p style={{ color: '#3d5570', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                    No ads scheduled for today
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── SCHEDULE TAB ── */}
          {activeTab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
              <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 28 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f5f0e8', marginBottom: 20 }}>
                  Today's Full Schedule — {new Date().toLocaleDateString('en-IN')}
                </h3>
                {schedule.map((s, i) => (
                  <div key={s.schedule_id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 100px', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#00c2a8' }}>{s.time_slot}</span>
                    <span style={{ fontSize: '0.88rem', color: '#f5f0e8' }}>{s.campaign_name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#7a90a8', fontFamily: 'monospace' }}>{s.duration_sec}s</span>
                    <span style={{ fontSize: '0.65rem', padding: '3px 10px', background: 'rgba(0,194,168,0.1)', color: '#00c2a8', fontFamily: 'monospace', letterSpacing: 1, textAlign: 'center' }}>
                      {s.show_type.toUpperCase()}
                    </span>
                  </div>
                ))}
                {schedule.length === 0 && (
                  <p style={{ color: '#3d5570', textAlign: 'center', padding: 40, fontSize: '0.9rem' }}>
                    No ads scheduled for today. Campaigns will appear here once approved.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── REVENUE TAB ── */}
          {activeTab === 'revenue' && (
            <motion.div key="revenue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total Earned',    value: `₹${(revenue?.total_earned || 0).toFixed(2)}`, color: '#4ade80' },
                  { label: 'Total Plays',     value: revenue?.total_plays || 0,                      color: '#ff6b1a' },
                  { label: 'Pending Payout',  value: `₹${(revenue?.pending_payout || 0).toFixed(2)}`, color: '#a78bfa' },
                ].map((s) => (
                  <div key={s.label} style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 28 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
                    <div style={{ fontSize: '0.8rem', color: '#7a90a8', marginTop: 6 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 28 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f5f0e8', marginBottom: 20 }}>Monthly Breakdown</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={[...monthly].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: '#7a90a8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#7a90a8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0b1828', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f0e8' }} />
                    <Bar dataKey="earned" fill="#ff6b1a" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* ── SUPPORT TAB ── */}
          {activeTab === 'support' && (
            <motion.div key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
              <SupportPanel headers={headers} theaterId={theater?.id || ''} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

// ── Support Panel ──
function SupportPanel({ headers, theaterId }: { headers: Record<string,string>; theaterId: string }) {
  const [subject,  setSubject]  = useState('')
  const [message,  setMessage]  = useState('')
  const [priority, setPriority] = useState('medium')
  const [tickets,  setTickets]  = useState<Array<{id:string;subject:string;status:string;priority:string;created_at:string}>>([])
  const [success,  setSuccess]  = useState(false)

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    fetch(`${API}/api/theaters/support`, { headers })
      .then(r => r.json())
      .then(d => { if (d.success) setTickets(d.tickets) })
  }, [])

  const submit = async () => {
    const res = await fetch(`${API}/api/theaters/support`, {
      method: 'POST', headers,
      body: JSON.stringify({ subject, message, priority }),
    })
    const data = await res.json()
    if (data.success) { setSuccess(true); setSubject(''); setMessage('') }
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 28 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f5f0e8', marginBottom: 20 }}>New Support Ticket</h3>
        {success && <p style={{ color: '#4ade80', marginBottom: 16, fontSize: '0.85rem' }}>✓ Ticket submitted successfully</p>}
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject *" style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#f5f0e8', fontSize: '0.875rem', marginBottom: 12, outline: 'none' }} />
        <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: '#0b1828', border: '1px solid rgba(255,255,255,0.07)', color: '#7a90a8', fontSize: '0.875rem', marginBottom: 12, outline: 'none' }}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue..." rows={5} style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#f5f0e8', fontSize: '0.875rem', resize: 'none', outline: 'none', marginBottom: 16 }} />
        <button onClick={submit} style={{ width: '100%', padding: '12px', background: '#ff6b1a', color: '#04080f', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}>
          Submit Ticket →
        </button>
      </div>
      <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.07)', padding: 28 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f5f0e8', marginBottom: 20 }}>My Tickets</h3>
        {tickets.map(t => (
          <div key={t.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.875rem', color: '#f5f0e8', marginBottom: 4 }}>{t.subject}</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: t.status === 'resolved' ? '#4ade80' : '#ff6b1a' }}>{t.status.toUpperCase()}</span>
              <span style={{ fontSize: '0.65rem', color: '#3d5570' }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        ))}
        {tickets.length === 0 && <p style={{ color: '#3d5570', fontSize: '0.85rem' }}>No tickets raised yet</p>}
      </div>
    </div>
  )
}
