# INFLLAX — Complete Project
## Corporate Site + DCMS (Theater Distribution System)

---

## 📁 PROJECT STRUCTURE

```
infllax-complete/
│
├── infllax/                    ← Corporate Website (Next.js — Port 3000)
│   ├── src/app/                   App Router pages
│   ├── src/components/            All UI components
│   │   ├── layout/                Navbar, Footer
│   │   └── sections/              Hero, Services, Audience, Why, How, Tech, CTA, Contact
│   ├── src/lib/
│   │   ├── constants.ts           All site data
│   │   ├── utils.ts               Helper functions
│   │   └── portal-links.ts        ← Links to DCMS portals
│   └── src/styles/globals.css     Global styles
│
├── infllax-dcms/
│   │
│   ├── dcms-backend/           ← Node.js + Express API (Port 5000)
│   │   ├── src/
│   │   │   ├── server.js          Main entry + WebSocket (Socket.io)
│   │   │   ├── config/
│   │   │   │   └── db.config.js   MySQL connection + 13-table schema
│   │   │   ├── middleware/
│   │   │   │   └── auth.middleware.js  JWT + RBAC
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.js       Advertiser auth
│   │   │   │   ├── theater.routes.js    Theater CRUD
│   │   │   │   ├── campaign.routes.js   Campaign + Razorpay
│   │   │   │   ├── schedule.routes.js   Playlist + playback logs
│   │   │   │   ├── revenue.routes.js    Payout calculations
│   │   │   │   ├── upload.routes.js     AWS S3 video upload
│   │   │   │   └── heartbeat.routes.js  Theater online status
│   │   │   └── controllers/
│   │   │       ├── theater.controller.js
│   │   │       └── campaign.controller.js
│   │   └── .env.example
│   │
│   ├── theater-portal/         ← Theater Owner Portal (Next.js — Port 3001)
│   │   └── src/app/dashboard/
│   │       └── page.tsx           Dashboard + Screens + Schedule + Revenue + Support
│   │                              (Recharts + RxJS + Socket.io)
│   │
│   ├── advertiser-panel/       ← Advertiser Campaign Panel (Next.js — Port 3002)
│   │   └── src/app/campaigns/
│   │       └── page.tsx           Overview + Campaigns + Create (3-step) + Analytics + Billing
│   │                              (Razorpay + AWS S3 + Recharts + Socket.io)
│   │
│   └── theater-client/         ← Theater Client App (Electron.js)
│       ├── src/
│       │   ├── main/main.js        Electron main process
│       │   ├── renderer/
│       │   │   ├── index.html      Theater screen player UI
│       │   │   └── preload.js      IPC bridge
│       │   └── services/
│       │       ├── heartbeat.service.js  60-sec ping (as per PDF)
│       │       ├── sync.service.js       Playlist + CDN download
│       │       └── playback.service.js   Ad scheduler + proof of play
│       └── package.json
```

---

## 🔗 HOW EVERYTHING IS CONNECTED

```
infllax.com (Port 3000)
    ↓  "Partner With Us" buttons
    ↓  → theater.infllax.com (Port 3001) [Theater Owner Portal]
    ↓  → advertiser.infllax.com (Port 3002) [Advertiser Panel]
    
Theater Portal / Advertiser Panel
    ↓  API calls
    ↓  → api.infllax.com (Port 5000) [Node.js Backend]
    
Backend API
    ↓  → MySQL Database (13 tables)
    ↓  → AWS S3 (ad video storage)
    ↓  → AWS CloudFront CDN (delivery)
    ↓  → Razorpay (payments)
    ↓  → Socket.io WebSocket (real-time)
    
Electron Theater Client
    ↓  → API: GET /api/schedule/playlist/:theater_id
    ↓  → API: POST /api/heartbeat/ping (every 60s)
    ↓  → API: POST /api/schedule/playback/log
    ↓  ← WebSocket: schedule updates, campaign approvals
```

---

## 🚀 HOW TO RUN (All 4 Parts)

### 1. Setup MySQL Database
```sql
CREATE DATABASE infllax_dcms;
```

### 2. Start Backend (Node.js — Port 5000)
```bash
cd infllax-dcms/dcms-backend
cp .env.example .env
# Fill in your MySQL password, Razorpay keys, AWS keys
npm install
npm run dev
```
✅ Tables auto-created on first run

### 3. Start Corporate Site (Port 3000)
```bash
cd infllax
cp .env.local.example .env.local
npm install
npm run dev
```
Open: http://localhost:3000

### 4. Start Theater Portal (Port 3001)
```bash
cd infllax-dcms/theater-portal
npm install
npm run dev
```
Open: http://localhost:3001

### 5. Start Advertiser Panel (Port 3002)
```bash
cd infllax-dcms/advertiser-panel
npm install
npm run dev
```
Open: http://localhost:3002

### 6. Run Theater Client (Electron)
```bash
cd infllax-dcms/theater-client
npm install
npm run dev
```

---

## 🛠 TECHNOLOGY STACK (As per PDF)

| Component          | Technology              |
|--------------------|-------------------------|
| Corporate Site     | Next.js 14 + Tailwind   |
| Theater Portal     | Next.js 14 + Tailwind   |
| Advertiser Panel   | Next.js 14 + Razorpay   |
| Backend API        | Node.js + Express       |
| Real-time          | Socket.io + RxJS        |
| Database           | MySQL (13 tables)       |
| File Storage       | AWS S3                  |
| Content Delivery   | AWS CloudFront CDN      |
| Payments           | Razorpay (UPI/Cards)    |
| Auth               | JWT + RBAC              |
| Theater App        | Electron.js             |
| Charts             | Recharts                |
| Animations         | Framer Motion           |

---

## 🔐 CONFIDENTIAL — NOT EXPOSED ON CORPORATE SITE
- FTV Engine logic
- Slab percentages
- Recoup formulas
- Internal revenue splits

---

## 📋 MYSQL TABLES (Auto-created)
1. theaters
2. screens
3. theater_auth
4. advertisers
5. advertiser_auth
6. campaigns
7. campaign_theaters
8. ad_schedules
9. playback_logs
10. theater_heartbeats
11. theater_revenue
12. payments
13. support_tickets

---

## 🌐 PRODUCTION DEPLOYMENT (GitHub + Vercel)

### Corporate Site → Vercel
```
vercel.com → Import infllax/ folder → Deploy
URL: infllax.vercel.app or infllax.com
```

### Backend → Railway / Render
```
railway.app → Deploy dcms-backend/
Add MySQL plugin → Set env vars → Deploy
URL: api.infllax.up.railway.app
```

### Theater Portal → Vercel
```
URL: theater.infllax.com
```

### Advertiser Panel → Vercel  
```
URL: advertiser.infllax.com
```

### Theater Client → GitHub Releases
```
npm run build:win   → .exe installer
npm run build:linux → .AppImage
Upload to GitHub Releases → theaters download and install
```

---

Built by Infllax Engineering Team
Stack: Next.js | Node.js | Java | Python | MySQL | AWS | Electron.js
