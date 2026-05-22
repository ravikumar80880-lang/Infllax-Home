// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Campaign Controller
// File: dcms-backend/src/controllers/campaign.controller.js
// Stack: Node.js + MySQL + Razorpay (as per PDF)
// ═══════════════════════════════════════════════════════

const Razorpay = require('razorpay')
const crypto   = require('crypto')
const { v4: uuidv4 } = require('uuid')
const { getPool } = require('../config/db.config')

// ── Razorpay Init (as per PDF: "Razorpay — India Payments") ──
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret',
})

// ── CREATE CAMPAIGN ──
async function createCampaign(req, res) {
  const pool = getPool()
  try {
    const {
      name, description, duration_sec = 30,
      format = 'pre_show',
      target_cities, target_states,
      budget_total, budget_daily,
      start_date, end_date,
    } = req.body

    const campaignId = uuidv4()
    await pool.execute(`
      INSERT INTO campaigns (
        id, advertiser_id, name, description, video_url,
        duration_sec, format, target_cities, target_states,
        budget_total, budget_daily, start_date, end_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `, [
      campaignId, req.user.id, name, description || '',
      '', // video_url set after upload
      duration_sec, format,
      JSON.stringify(target_cities || []),
      JSON.stringify(target_states || []),
      budget_total, budget_daily || null,
      start_date, end_date,
    ])

    res.status(201).json({ success: true, message: 'Campaign created', campaignId })
  } catch (err) {
    console.error('Create campaign error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET MY CAMPAIGNS ──
async function getMyCampaigns(req, res) {
  const pool = getPool()
  try {
    const { status } = req.query
    let query = `
      SELECT c.*,
        (SELECT COUNT(*) FROM campaign_theaters ct WHERE ct.campaign_id = c.id) AS theater_count,
        (SELECT COUNT(*) FROM playback_logs pl WHERE pl.campaign_id = c.id) AS total_plays
      FROM campaigns c
      WHERE c.advertiser_id = ?
    `
    const vals = [req.user.id]
    if (status) { query += ' AND c.status=?'; vals.push(status) }
    query += ' ORDER BY c.created_at DESC'

    const [campaigns] = await pool.execute(query, vals)
    res.json({ success: true, campaigns })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET CAMPAIGN BY ID ──
async function getCampaignById(req, res) {
  const pool = getPool()
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM campaigns WHERE id=? AND advertiser_id=?',
      [req.params.id, req.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, campaign: rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── UPDATE CAMPAIGN ──
async function updateCampaign(req, res) {
  const pool = getPool()
  try {
    const { name, description, budget_daily, start_date, end_date } = req.body
    await pool.execute(`
      UPDATE campaigns SET name=?, description=?, budget_daily=?, start_date=?, end_date=?
      WHERE id=? AND advertiser_id=? AND status='draft'
    `, [name, description, budget_daily, start_date, end_date, req.params.id, req.user.id])
    res.json({ success: true, message: 'Campaign updated' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── INIT RAZORPAY PAYMENT ──
// PDF: "Razorpay Payment — Pay for campaign — UPI, card, net banking"
async function initPayment(req, res) {
  const pool = getPool()
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM campaigns WHERE id=? AND advertiser_id=?',
      [req.params.id, req.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Campaign not found' })

    const campaign = rows[0]
    const gstAmount = campaign.budget_total * 0.18 // 18% GST
    const totalAmount = parseFloat(campaign.budget_total) + gstAmount

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount:   Math.round(totalAmount * 100), // in paise
      currency: 'INR',
      receipt:  `infllax_camp_${campaign.id.slice(0, 8)}`,
      notes: {
        campaign_id:   campaign.id,
        advertiser_id: req.user.id,
        campaign_name: campaign.name,
      },
    })

    // Save payment record
    const paymentId = uuidv4()
    await pool.execute(`
      INSERT INTO payments (id, advertiser_id, campaign_id, razorpay_order_id, amount, gst_amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [paymentId, req.user.id, campaign.id, order.id, totalAmount, gstAmount])

    res.json({
      success: true,
      order,
      key:        process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
      amount:     totalAmount,
      gst:        gstAmount,
      currency:   'INR',
      campaign:   campaign.name,
    })
  } catch (err) {
    console.error('Payment init error:', err)
    res.status(500).json({ success: false, message: 'Payment initialization failed' })
  }
}

// ── VERIFY RAZORPAY PAYMENT ──
async function verifyPayment(req, res) {
  const pool = getPool()
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    // Signature verification
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret')
      .update(body)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' })
    }

    const conn = await pool.getConnection()
    await conn.beginTransaction()

    try {
      // Update payment record
      await conn.execute(`
        UPDATE payments SET razorpay_payment_id=?, status='paid', paid_at=NOW()
        WHERE razorpay_order_id=?
      `, [razorpay_payment_id, razorpay_order_id])

      // Activate campaign
      await conn.execute(`
        UPDATE campaigns SET status='pending_payment', payment_id=?
        WHERE id = (SELECT campaign_id FROM payments WHERE razorpay_order_id=? LIMIT 1)
      `, [razorpay_payment_id, razorpay_order_id])

      await conn.commit()

      res.json({ success: true, message: 'Payment verified. Campaign sent for admin review.' })
    } catch (e) {
      await conn.rollback()
      throw e
    } finally {
      conn.release()
    }
  } catch (err) {
    console.error('Payment verify error:', err)
    res.status(500).json({ success: false, message: 'Payment verification error' })
  }
}

// ── CAMPAIGN ANALYTICS ──
async function getCampaignAnalytics(req, res) {
  const pool = getPool()
  try {
    // Total stats
    const [totals] = await pool.execute(`
      SELECT
        COUNT(*)           AS total_plays,
        SUM(duration_sec)  AS total_duration_sec,
        COUNT(DISTINCT theater_id) AS theaters_reached
      FROM playback_logs WHERE campaign_id=?
    `, [req.params.id])

    // Daily plays breakdown
    const [daily] = await pool.execute(`
      SELECT
        DATE(played_at) AS date,
        COUNT(*)         AS plays
      FROM playback_logs
      WHERE campaign_id=?
      GROUP BY DATE(played_at)
      ORDER BY date DESC
      LIMIT 30
    `, [req.params.id])

    // Per-theater breakdown
    const [byTheater] = await pool.execute(`
      SELECT
        t.name AS theater_name, t.city,
        COUNT(*) AS plays
      FROM playback_logs pl
      JOIN theaters t ON t.id = pl.theater_id
      WHERE pl.campaign_id=?
      GROUP BY pl.theater_id
      ORDER BY plays DESC
    `, [req.params.id])

    res.json({ success: true, totals: totals[0], daily, byTheater })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET CAMPAIGN THEATERS ──
async function getCampaignTheaters(req, res) {
  const pool = getPool()
  try {
    const [theaters] = await pool.execute(`
      SELECT t.id, t.name, t.city, t.state, t.total_screens, ct.is_active
      FROM campaign_theaters ct
      JOIN theaters t ON t.id = ct.theater_id
      WHERE ct.campaign_id=?
    `, [req.params.id])
    res.json({ success: true, theaters })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── ASSIGN THEATERS TO CAMPAIGN ──
async function assignTheaters(req, res) {
  const pool = getPool()
  try {
    const { theater_ids } = req.body // array of theater IDs
    const conn = await pool.getConnection()
    await conn.beginTransaction()

    try {
      // Clear existing
      await conn.execute('DELETE FROM campaign_theaters WHERE campaign_id=?', [req.params.id])

      // Insert new
      for (const tid of theater_ids) {
        await conn.execute(`
          INSERT INTO campaign_theaters (id, campaign_id, theater_id) VALUES (?, ?, ?)
        `, [uuidv4(), req.params.id, tid])
      }

      await conn.commit()
      res.json({ success: true, message: `${theater_ids.length} theaters assigned` })
    } catch (e) {
      await conn.rollback()
      throw e
    } finally {
      conn.release()
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── ADMIN: GET ALL CAMPAIGNS ──
async function getAllCampaigns(req, res) {
  const pool = getPool()
  try {
    const [campaigns] = await pool.execute(`
      SELECT c.*, a.company_name AS advertiser
      FROM campaigns c
      JOIN advertisers a ON a.id = c.advertiser_id
      ORDER BY c.created_at DESC
    `)
    res.json({ success: true, campaigns })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── ADMIN: APPROVE / REJECT ──
async function approveCampaign(req, res) {
  const pool = getPool()
  try {
    await pool.execute(
      "UPDATE campaigns SET status='active' WHERE id=?", [req.params.id]
    )
    // Notify via WebSocket
    const io = req.app.get('io')
    io.emit('campaign:approved', { campaignId: req.params.id })
    res.json({ success: true, message: 'Campaign approved and activated' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

async function rejectCampaign(req, res) {
  const pool = getPool()
  try {
    const { reason } = req.body
    await pool.execute(
      "UPDATE campaigns SET status='rejected' WHERE id=?", [req.params.id]
    )
    res.json({ success: true, message: 'Campaign rejected', reason })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  createCampaign, getMyCampaigns, getCampaignById, updateCampaign,
  initPayment, verifyPayment, getCampaignAnalytics,
  getCampaignTheaters, assignTheaters,
  getAllCampaigns, approveCampaign, rejectCampaign,
}
