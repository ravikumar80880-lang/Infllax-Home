// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Revenue Route
// File: dcms-backend/src/routes/revenue.routes.js
// ═══════════════════════════════════════════════════════

const express = require('express')
const router  = express.Router()
const { verifyToken, adminOnly } = require('../middleware/auth.middleware')
const { getPool } = require('../config/db.config')
const { v4: uuidv4 } = require('uuid')

// Admin: Calculate + create revenue records for a period
router.post('/calculate', verifyToken, adminOnly, async (req, res) => {
  const pool = getPool()
  const conn = await pool.getConnection()
  try {
    const { period_start, period_end, theater_share_pct = 60 } = req.body

    // Get all plays in period
    const [plays] = await conn.execute(`
      SELECT
        pl.theater_id,
        pl.campaign_id,
        COUNT(*) AS plays_count,
        c.budget_total / DATEDIFF(c.end_date, c.start_date) AS daily_budget
      FROM playback_logs pl
      JOIN campaigns c ON c.id = pl.campaign_id
      WHERE DATE(pl.played_at) BETWEEN ? AND ?
      GROUP BY pl.theater_id, pl.campaign_id
    `, [period_start, period_end])

    await conn.beginTransaction()

    for (const row of plays) {
      const gross       = (row.daily_budget / 3) * row.plays_count // 3 plays/day avg
      const platform    = gross * (1 - theater_share_pct / 100)
      const net         = gross - platform

      await conn.execute(`
        INSERT INTO theater_revenue
          (id, theater_id, campaign_id, plays_count, gross_amount, platform_cut, net_amount, period_start, period_end)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE plays_count=VALUES(plays_count), net_amount=VALUES(net_amount)
      `, [uuidv4(), row.theater_id, row.campaign_id, row.plays_count, gross, platform, net, period_start, period_end])
    }

    await conn.commit()
    res.json({ success: true, message: `Revenue calculated for ${plays.length} theater-campaign pairs` })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ success: false, message: err.message })
  } finally {
    conn.release()
  }
})

// Admin: Get all pending payouts
router.get('/payouts/pending', verifyToken, adminOnly, async (req, res) => {
  const pool = getPool()
  try {
    const [rows] = await pool.execute(`
      SELECT tr.*, t.name AS theater_name, t.city, c.name AS campaign_name
      FROM theater_revenue tr
      JOIN theaters t ON t.id = tr.theater_id
      JOIN campaigns c ON c.id = tr.campaign_id
      WHERE tr.payout_status = 'pending'
      ORDER BY tr.net_amount DESC
    `)
    res.json({ success: true, payouts: rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Admin: Mark as paid
router.put('/payouts/:id/pay', verifyToken, adminOnly, async (req, res) => {
  const pool = getPool()
  try {
    await pool.execute(
      "UPDATE theater_revenue SET payout_status='paid', payout_date=NOW() WHERE id=?",
      [req.params.id]
    )
    res.json({ success: true, message: 'Payout marked as paid' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
