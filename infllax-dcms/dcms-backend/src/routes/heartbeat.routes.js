// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Heartbeat + Schedule Routes
// File: dcms-backend/src/routes/heartbeat.routes.js
// PDF: "Heartbeat Signal — Sends online status to central
//       server every 60 seconds"
// ═══════════════════════════════════════════════════════

const express = require('express')
const router  = express.Router()
const { v4: uuidv4 } = require('uuid')
const { getPool } = require('../config/db.config')

// ── HEARTBEAT from Electron App ──
// Called every 60 seconds by theater client
router.post('/ping', async (req, res) => {
  const pool = getPool()
  try {
    const { theater_id, app_version, status = 'online' } = req.body
    const ip = req.ip || req.connection.remoteAddress

    await pool.execute(`
      INSERT INTO theater_heartbeats (id, theater_id, status, ip_address, app_version)
      VALUES (?, ?, ?, ?, ?)
    `, [uuidv4(), theater_id, status, ip, app_version])

    // Broadcast to admin dashboard via WebSocket
    const io = req.app.get('io')
    io.emit('admin:theater:status', { theater_id, status, timestamp: new Date() })

    res.json({ success: true, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── GET ONLINE THEATERS (admin) ──
router.get('/status', async (req, res) => {
  const pool = getPool()
  try {
    const [rows] = await pool.execute(`
      SELECT t.id, t.name, t.city,
        h.status, h.recorded_at, h.app_version
      FROM theaters t
      LEFT JOIN theater_heartbeats h ON h.theater_id = t.id
        AND h.recorded_at = (
          SELECT MAX(recorded_at) FROM theater_heartbeats WHERE theater_id = t.id
        )
      WHERE t.status = 'active'
      ORDER BY t.name
    `)
    res.json({ success: true, theaters: rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
