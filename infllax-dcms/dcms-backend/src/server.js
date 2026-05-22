// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Main Server Entry Point
// File: dcms-backend/src/server.js
// Stack: Node.js + Express (as per PDF tech stack)
// Port: 5000
// ═══════════════════════════════════════════════════════

require('dotenv').config()
const express    = require('express')
const http       = require('http')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const { Server } = require('socket.io')

// ── Route Imports ──
const authRoutes     = require('./routes/auth.routes')
const theaterRoutes  = require('./routes/theater.routes')
const campaignRoutes = require('./routes/campaign.routes')
const scheduleRoutes = require('./routes/schedule.routes')
const revenueRoutes  = require('./routes/revenue.routes')
const uploadRoutes   = require('./routes/upload.routes')
const heartbeatRoutes = require('./routes/heartbeat.routes')

// ── DB Connection ──
const { connectDB } = require('./config/db.config')

// ── App Init ──
const app    = express()
const server = http.createServer(app)

// ── WebSocket (Socket.io) ──
// PDF: "Real-time WebSockets / MQTT — Live status updates from theaters"
const io = new Server(server, {
  cors: {
    origin: [
      process.env.THEATER_PORTAL_URL  || 'http://localhost:3001',
      process.env.ADVERTISER_PANEL_URL || 'http://localhost:3002',
      process.env.ADMIN_URL            || 'http://localhost:3003',
    ],
    methods: ['GET', 'POST'],
  },
})

// ── Middleware ──
app.use(helmet())
app.use(cors({
  origin: [
    process.env.THEATER_PORTAL_URL   || 'http://localhost:3001',
    process.env.ADVERTISER_PANEL_URL || 'http://localhost:3002',
    process.env.ADMIN_URL            || 'http://localhost:3003',
  ],
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// ── Make io available to routes ──
app.set('io', io)

// ── Routes ──
app.use('/api/auth',      authRoutes)
app.use('/api/theaters',  theaterRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/schedule',  scheduleRoutes)
app.use('/api/revenue',   revenueRoutes)
app.use('/api/upload',    uploadRoutes)
app.use('/api/heartbeat', heartbeatRoutes)

// ── Health Check ──
app.get('/health', (req, res) => {
  res.json({
    status:    'UP',
    service:   'Infllax DCMS Backend',
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
  })
})

// ── 404 Handler ──
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  })
})

// ── WebSocket Events ──
io.on('connection', (socket) => {
  console.log(`🔌 Theater client connected: ${socket.id}`)

  // Theater registers itself
  socket.on('theater:register', ({ theaterId }) => {
    socket.join(`theater:${theaterId}`)
    console.log(`🎬 Theater ${theaterId} registered`)
    io.to(`theater:${theaterId}`).emit('theater:registered', { theaterId, status: 'online' })
  })

  // Heartbeat from Electron client (every 60 seconds as per PDF)
  socket.on('theater:heartbeat', ({ theaterId, status }) => {
    console.log(`💓 Heartbeat from Theater ${theaterId}`)
    io.emit('admin:theater:heartbeat', { theaterId, status, timestamp: new Date() })
  })

  // Playback log from theater client
  socket.on('theater:playback:log', (data) => {
    console.log(`▶️  Playback log:`, data)
    io.emit('admin:playback:log', data)
  })

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`)
  })
})

// ── Start Server ──
const PORT = process.env.PORT || 5000

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 Infllax DCMS Backend running on port ${PORT}`)
    console.log(`📡 WebSocket ready for theater clients`)
    console.log(`🗄️  MySQL connected`)
    console.log(`🌐 Health: http://localhost:${PORT}/health\n`)
  })
}).catch((err) => {
  console.error('❌ DB connection failed:', err.message)
  process.exit(1)
})

module.exports = { app, io }
