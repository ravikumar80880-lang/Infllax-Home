// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Heartbeat Service
// File: theater-client/src/services/heartbeat.service.js
// PDF: "Heartbeat Signal — Sends online status to central
//       server every 60 seconds"
// Stack: Node.js + Socket.io-client + HTTP
// ═══════════════════════════════════════════════════════

const { io }  = require('socket.io-client')
const os      = require('os')
const { app } = require('electron')

class HeartbeatService {
  constructor(config, mainWindow) {
    this.config     = config
    this.mainWindow = mainWindow
    this.interval   = null
    this.socket     = null
    this.isOnline   = false
  }

  start() {
    // Connect WebSocket to backend
    this.socket = io(this.config.api_url, {
      reconnectionAttempts: Infinity,
      reconnectionDelay:    3000,
    })

    this.socket.on('connect', () => {
      this.isOnline = true
      console.log('🔌 Connected to Infllax backend via WebSocket')

      // Register theater
      this.socket.emit('theater:register', {
        theaterId: this.config.theater_id,
      })

      // Notify renderer
      this._sendToRenderer('heartbeat:status', { online: true })
    })

    this.socket.on('disconnect', () => {
      this.isOnline = false
      console.log('❌ Disconnected from backend')
      this._sendToRenderer('heartbeat:status', { online: false })
    })

    // Listen for admin schedule updates
    this.socket.on('schedule:update', (data) => {
      console.log('📅 Schedule update received:', data)
      this._sendToRenderer('schedule:update', data)
    })

    // Listen for campaign approvals
    this.socket.on('campaign:approved', (data) => {
      this._sendToRenderer('campaign:approved', data)
    })

    // ── HTTP Heartbeat every 60 seconds (as per PDF) ──
    this.interval = setInterval(async () => {
      await this._sendHeartbeat()
    }, 60 * 1000) // 60,000 ms = 60 seconds

    // Send immediately on start
    this._sendHeartbeat()
  }

  async _sendHeartbeat() {
    try {
      const payload = {
        theater_id:  this.config.theater_id,
        status:      'online',
        app_version: this.config.app_version || '1.0.0',
      }

      // HTTP POST heartbeat
      const res = await fetch(`${this.config.api_url}/api/heartbeat/ping`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })

      // Also emit via WebSocket
      if (this.socket?.connected) {
        this.socket.emit('theater:heartbeat', {
          theaterId: this.config.theater_id,
          status:    'online',
          timestamp: new Date().toISOString(),
          device:    {
            platform: os.platform(),
            arch:     os.arch(),
            hostname: os.hostname(),
            memory:   `${Math.round(os.freemem() / 1024 / 1024)}MB free`,
          },
        })
      }

      console.log(`💓 Heartbeat sent — ${new Date().toLocaleTimeString()}`)
      this._sendToRenderer('heartbeat:ping', { timestamp: new Date() })

    } catch (err) {
      console.error('❌ Heartbeat failed:', err.message)
      this._sendToRenderer('heartbeat:status', { online: false, error: err.message })
    }
  }

  stop() {
    if (this.interval) clearInterval(this.interval)
    if (this.socket)   this.socket.disconnect()
    console.log('🛑 Heartbeat service stopped')
  }

  getSocket() { return this.socket }

  _sendToRenderer(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data)
    }
  }
}

module.exports = HeartbeatService
