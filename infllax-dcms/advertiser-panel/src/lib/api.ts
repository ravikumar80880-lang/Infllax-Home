// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Shared API Client
// File: advertiser-panel/src/lib/api.ts
// Connects to: dcms-backend (Node.js + Express — port 5000)
// Also links to: infllax-corporate site contact form
// ═══════════════════════════════════════════════════════

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// ── Auth Token Helper ──
function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('advertiser_token') || ''
}

function authHeaders(): Record<string, string> {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${getToken()}`,
  }
}

// ── Generic Fetch Wrapper ──
async function apiFetch<T>(
  path:    string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'API error')
  return data
}

// ═══════════════════════════
// AUTH
// ═══════════════════════════
export const AuthAPI = {
  register: (body: object) =>
    apiFetch('/api/auth/advertiser/register', { method: 'POST', body: JSON.stringify(body) }),

  login: async (email: string, password: string) => {
    const data: any = await apiFetch('/api/auth/advertiser/login', {
      method: 'POST',
      body:   JSON.stringify({ email, password }),
    })
    if (data.token) localStorage.setItem('advertiser_token', data.token)
    return data
  },

  logout: () => { localStorage.removeItem('advertiser_token'); window.location.href = '/login' },
}

// ═══════════════════════════
// CAMPAIGNS
// ═══════════════════════════
export const CampaignAPI = {
  create:          (body: object)        => apiFetch('/api/campaigns',              { method: 'POST', body: JSON.stringify(body) }),
  getAll:          (status?: string)     => apiFetch(`/api/campaigns${status ? `?status=${status}` : ''}`),
  getById:         (id: string)          => apiFetch(`/api/campaigns/${id}`),
  update:          (id: string, body: object) => apiFetch(`/api/campaigns/${id}`,  { method: 'PUT',  body: JSON.stringify(body) }),
  getAnalytics:    (id: string)          => apiFetch(`/api/campaigns/${id}/analytics`),
  getTheaters:     (id: string)          => apiFetch(`/api/campaigns/${id}/theaters`),
  assignTheaters:  (id: string, ids: string[]) =>
    apiFetch(`/api/campaigns/${id}/theaters`, { method: 'POST', body: JSON.stringify({ theater_ids: ids }) }),
  initPayment:     (id: string)          => apiFetch(`/api/campaigns/${id}/pay`,    { method: 'POST' }),
  verifyPayment:   (id: string, body: object) =>
    apiFetch(`/api/campaigns/${id}/pay/verify`, { method: 'POST', body: JSON.stringify(body) }),
}

// ═══════════════════════════
// UPLOAD (AWS S3 via backend)
// ═══════════════════════════
export const UploadAPI = {
  uploadVideo: async (file: File, campaignId?: string): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('video', file)
    if (campaignId) form.append('campaign_id', campaignId)
    const res  = await fetch(`${API_BASE}/api/upload/ad-video`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body:    form,
    })
    return res.json()
  },

  uploadThumbnail: async (file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('thumbnail', file)
    const res  = await fetch(`${API_BASE}/api/upload/thumbnail`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body:    form,
    })
    return res.json()
  },
}

// ═══════════════════════════
// CORPORATE SITE LINK
// Links back to infllax-corporate home page
// ═══════════════════════════
export const CORPORATE_SITE_URL = process.env.NEXT_PUBLIC_CORPORATE_URL || 'http://localhost:3000'
export const THEATER_PORTAL_URL = process.env.NEXT_PUBLIC_THEATER_URL   || 'http://localhost:3001'
