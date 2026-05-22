// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Auth Routes (Advertiser)
// File: dcms-backend/src/routes/auth.routes.js
// ═══════════════════════════════════════════════════════

const express  = require('express')
const router   = express.Router()
const bcrypt   = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { getPool } = require('../config/db.config')
const { generateToken } = require('../middleware/auth.middleware')

// ── ADVERTISER REGISTER ──
router.post('/advertiser/register', async (req, res) => {
  const pool = getPool()
  const conn = await pool.getConnection()
  try {
    const { company_name, contact_name, email, phone, password, city, state, gst_number } = req.body

    const [exists] = await conn.execute('SELECT id FROM advertisers WHERE email=?', [email])
    if (exists.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' })
    }

    await conn.beginTransaction()

    const advId = uuidv4()
    await conn.execute(`
      INSERT INTO advertisers (id, company_name, contact_name, email, phone, city, state, gst_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [advId, company_name, contact_name, email, phone, city, state, gst_number || null])

    const hashed = await bcrypt.hash(password, 12)
    await conn.execute(`
      INSERT INTO advertiser_auth (id, advertiser_id, password) VALUES (?, ?, ?)
    `, [uuidv4(), advId, hashed])

    await conn.commit()

    res.status(201).json({ success: true, message: 'Advertiser account created', advertiserId: advId })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ success: false, message: err.message })
  } finally {
    conn.release()
  }
})

// ── ADVERTISER LOGIN ──
router.post('/advertiser/login', async (req, res) => {
  const pool = getPool()
  try {
    const { email, password } = req.body

    const [rows] = await pool.execute(`
      SELECT a.*, aa.password AS pwd
      FROM advertisers a
      JOIN advertiser_auth aa ON aa.advertiser_id = a.id
      WHERE a.email=?
    `, [email])

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const adv   = rows[0]
    const valid = await bcrypt.compare(password, adv.pwd)
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    await pool.execute('UPDATE advertiser_auth SET last_login=NOW() WHERE advertiser_id=?', [adv.id])

    const token = generateToken({
      id:    adv.id,
      email: adv.email,
      role:  'advertiser',
      name:  adv.contact_name,
    })

    res.json({
      success: true,
      token,
      advertiser: {
        id:           adv.id,
        company_name: adv.company_name,
        email:        adv.email,
        city:         adv.city,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
