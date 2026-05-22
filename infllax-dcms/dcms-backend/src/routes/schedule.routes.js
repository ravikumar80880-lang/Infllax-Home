// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Schedule + Playback Log Routes
// File: dcms-backend/src/routes/schedule.routes.js
// PDF: "Scheduling engine compiles playlist and pushes
//       to theaters via API"
// ═══════════════════════════════════════════════════════

const express = require('express')
const router  = express.Router()
const { v4: uuidv4 } = require('uuid')
const { getPool } = require('../config/db.config')
const { verifyToken, adminOnly } = require('../middleware/auth.middleware')

// ── GET PLAYLIST FOR TODAY (called by Electron app on startup) ──
// Theater authenticates with theater_id, pulls today's playlist
router.get('/playlist/:theater_id', async (req, res) => {
  const pool = getPool()
  try {
    const today = new Date().toISOString().split('T')[0]
    const { theater_id } = req.params

    const [playlist] = await pool.execute(`
      SELECT
        s.id AS schedule_id,
        s.time_slot,
        s.show_type,
        s.status,
        c.id AS campaign_id,
        c.name AS campaign_name,
        c.video_url,
        c.duration_sec,
        c.format,
        sc.screen_name
      FROM ad_schedules s
      JOIN campaigns c ON c.id = s.campaign_id AND c.status = 'active'
      LEFT JOIN screens sc ON sc.id = s.screen_id
      WHERE s.theater_id = ?
        AND s.scheduled_date = ?
        AND s.status = 'scheduled'
      ORDER BY s.time_slot ASC
    `, [theater_id, today])

    res.json({
      success:     true,
      theater_id,
      date:        today,
      total_slots: playlist.length,
      playlist,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── PLAYBACK LOG (from Electron after each ad plays) ──
// PDF: "Playback Log Reporter — Reports every single ad play
//       with timestamp and duration"
router.post('/playback/log', async (req, res) => {
  const pool = getPool()
  try {
    const {
      schedule_id, campaign_id, theater_id, screen_id,
      played_at, duration_sec, completed, device_info,
    } = req.body

    const logId = uuidv4()
    await pool.execute(`
      INSERT INTO playback_logs
        (id, schedule_id, campaign_id, theater_id, screen_id, played_at, duration_sec, completed, device_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      logId, schedule_id, campaign_id, theater_id,
      screen_id || null, played_at, duration_sec,
      completed !== false, JSON.stringify(device_info || {}),
    ])

    // Update schedule status
    await pool.execute(
      "UPDATE ad_schedules SET status='played', played_at=? WHERE id=?",
      [played_at, schedule_id]
    )

    // Update campaign impression count
    await pool.execute(
      'UPDATE campaigns SET impressions = impressions + 1 WHERE id=?',
      [campaign_id]
    )

    // Broadcast to admin dashboard
    const io = req.app.get('io')
    io.emit('admin:playback:new', {
      theater_id, campaign_id, played_at, completed,
    })

    res.json({ success: true, logId })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── ADMIN: CREATE SCHEDULE ──
router.post('/', verifyToken, adminOnly, async (req, res) => {
  const pool = getPool()
  try {
    const { campaign_id, theater_id, screen_id, scheduled_date, time_slot, show_type } = req.body
    const scheduleId = uuidv4()

    await pool.execute(`
      INSERT INTO ad_schedules (id, campaign_id, theater_id, screen_id, scheduled_date, time_slot, show_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [scheduleId, campaign_id, theater_id, screen_id || null, scheduled_date, time_slot, show_type || 'evening'])

    // Push to theater client via WebSocket
    const io = req.app.get('io')
    io.to(`theater:${theater_id}`).emit('schedule:update', {
      scheduleId, scheduled_date, time_slot,
    })

    res.status(201).json({ success: true, scheduleId })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── ADMIN: BULK SCHEDULE (campaign across multiple theaters) ──
router.post('/bulk', verifyToken, adminOnly, async (req, res) => {
  const pool = getPool()
  const conn = await pool.getConnection()
  try {
    const { campaign_id, theater_ids, start_date, end_date, time_slots } = req.body

    await conn.beginTransaction()

    const start  = new Date(start_date)
    const end    = new Date(end_date)
    let   count  = 0

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      for (const tid of theater_ids) {
        for (const slot of time_slots) {
          await conn.execute(`
            INSERT INTO ad_schedules (id, campaign_id, theater_id, scheduled_date, time_slot)
            VALUES (?, ?, ?, ?, ?)
          `, [uuidv4(), campaign_id, tid, dateStr, slot])
          count++
        }
      }
    }

    await conn.commit()
    res.json({ success: true, message: `${count} schedule slots created` })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ success: false, message: err.message })
  } finally {
    conn.release()
  }
})

module.exports = router
