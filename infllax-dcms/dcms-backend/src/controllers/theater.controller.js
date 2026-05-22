// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Theater Controller
// File: dcms-backend/src/controllers/theater.controller.js
// Stack: Node.js + MySQL2 + JWT
// ═══════════════════════════════════════════════════════

const bcrypt  = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { getPool }    = require('../config/db.config')
const { generateToken } = require('../middleware/auth.middleware')

// ── REGISTER THEATER ──
async function register(req, res) {
  const pool = getPool()
  const conn = await pool.getConnection()

  try {
    const {
      name, owner_name, email, phone, password,
      address, city, state, pincode,
      total_screens = 1, seating_capacity = 100,
    } = req.body

    // Check duplicate email
    const [existing] = await conn.execute(
      'SELECT id FROM theaters WHERE email = ?', [email]
    )
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' })
    }

    await conn.beginTransaction()

    // Insert theater
    const theaterId = uuidv4()
    await conn.execute(`
      INSERT INTO theaters (id, name, owner_name, email, phone, address, city, state, pincode, total_screens, seating_capacity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [theaterId, name, owner_name, email, phone, address, city, state, pincode, total_screens, seating_capacity])

    // Hash password + store auth
    const hashed = await bcrypt.hash(password, 12)
    await conn.execute(`
      INSERT INTO theater_auth (id, theater_id, password) VALUES (?, ?, ?)
    `, [uuidv4(), theaterId, hashed])

    // Auto-create screen 1
    await conn.execute(`
      INSERT INTO screens (id, theater_id, screen_name, capacity) VALUES (?, ?, ?, ?)
    `, [uuidv4(), theaterId, 'Screen 1', seating_capacity])

    await conn.commit()

    res.status(201).json({
      success: true,
      message: 'Theater registered successfully. Pending admin approval.',
      theaterId,
    })

  } catch (err) {
    await conn.rollback()
    console.error('Theater register error:', err)
    res.status(500).json({ success: false, message: 'Registration failed' })
  } finally {
    conn.release()
  }
}

// ── LOGIN ──
async function login(req, res) {
  const pool = getPool()
  try {
    const { email, password } = req.body

    const [rows] = await pool.execute(`
      SELECT t.*, ta.password AS pwd
      FROM theaters t
      JOIN theater_auth ta ON ta.theater_id = t.id
      WHERE t.email = ?
    `, [email])

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const theater = rows[0]

    if (theater.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' })
    }

    const valid = await bcrypt.compare(password, theater.pwd)
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    // Update last login
    await pool.execute(
      'UPDATE theater_auth SET last_login = NOW() WHERE theater_id = ?', [theater.id]
    )

    const token = generateToken({
      id:    theater.id,
      email: theater.email,
      role:  'theater_owner',
      name:  theater.owner_name,
    })

    res.json({
      success: true,
      token,
      theater: {
        id:     theater.id,
        name:   theater.name,
        email:  theater.email,
        status: theater.status,
        city:   theater.city,
        state:  theater.state,
      },
    })

  } catch (err) {
    console.error('Theater login error:', err)
    res.status(500).json({ success: false, message: 'Login failed' })
  }
}

// ── GET MY THEATER ──
async function getMyTheater(req, res) {
  const pool = getPool()
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, owner_name, email, phone, address, city, state, pincode, total_screens, seating_capacity, status, onboarded_at, created_at FROM theaters WHERE id = ?',
      [req.user.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Theater not found' })
    }
    res.json({ success: true, theater: rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── UPDATE THEATER ──
async function updateTheater(req, res) {
  const pool = getPool()
  try {
    const { name, phone, address, city, state, pincode } = req.body
    await pool.execute(`
      UPDATE theaters SET name=?, phone=?, address=?, city=?, state=?, pincode=? WHERE id=?
    `, [name, phone, address, city, state, pincode, req.user.id])
    res.json({ success: true, message: 'Theater updated' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET SCREENS ──
async function getScreens(req, res) {
  const pool = getPool()
  try {
    const [screens] = await pool.execute(
      'SELECT * FROM screens WHERE theater_id = ? ORDER BY screen_name',
      [req.user.id]
    )
    res.json({ success: true, screens })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── ADD SCREEN ──
async function addScreen(req, res) {
  const pool = getPool()
  try {
    const { screen_name, capacity, screen_type } = req.body
    const screenId = uuidv4()
    await pool.execute(`
      INSERT INTO screens (id, theater_id, screen_name, capacity, screen_type)
      VALUES (?, ?, ?, ?, ?)
    `, [screenId, req.user.id, screen_name, capacity, screen_type || 'standard'])
    res.status(201).json({ success: true, message: 'Screen added', screenId })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── UPDATE SCREEN ──
async function updateScreen(req, res) {
  const pool = getPool()
  try {
    const { screen_name, capacity, screen_type, is_active } = req.body
    await pool.execute(`
      UPDATE screens SET screen_name=?, capacity=?, screen_type=?, is_active=?
      WHERE id=? AND theater_id=?
    `, [screen_name, capacity, screen_type, is_active, req.params.id, req.user.id])
    res.json({ success: true, message: 'Screen updated' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── DELETE SCREEN ──
async function deleteScreen(req, res) {
  const pool = getPool()
  try {
    await pool.execute(
      'DELETE FROM screens WHERE id=? AND theater_id=?',
      [req.params.id, req.user.id]
    )
    res.json({ success: true, message: 'Screen removed' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET TODAY'S SCHEDULE ──
async function getTodaySchedule(req, res) {
  const pool = getPool()
  try {
    const today = new Date().toISOString().split('T')[0]
    const [schedule] = await pool.execute(`
      SELECT s.*, c.name AS campaign_name, c.video_url, c.duration_sec,
             sc.screen_name
      FROM ad_schedules s
      JOIN campaigns c ON c.id = s.campaign_id
      LEFT JOIN screens sc ON sc.id = s.screen_id
      WHERE s.theater_id = ? AND s.scheduled_date = ?
      ORDER BY s.time_slot ASC
    `, [req.user.id, today])
    res.json({ success: true, date: today, schedule })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET REVENUE ──
async function getRevenue(req, res) {
  const pool = getPool()
  try {
    const { period = 'month' } = req.query

    // Summary
    const [summary] = await pool.execute(`
      SELECT
        SUM(net_amount)   AS total_earned,
        SUM(plays_count)  AS total_plays,
        COUNT(*)          AS total_campaigns,
        SUM(CASE WHEN payout_status='pending' THEN net_amount ELSE 0 END) AS pending_payout
      FROM theater_revenue
      WHERE theater_id = ?
    `, [req.user.id])

    // Monthly breakdown
    const [monthly] = await pool.execute(`
      SELECT
        DATE_FORMAT(period_start, '%b %Y') AS month,
        SUM(net_amount) AS earned,
        SUM(plays_count) AS plays
      FROM theater_revenue
      WHERE theater_id = ?
      GROUP BY YEAR(period_start), MONTH(period_start)
      ORDER BY period_start DESC
      LIMIT 12
    `, [req.user.id])

    res.json({ success: true, summary: summary[0], monthly })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET PAYMENTS ──
async function getPayments(req, res) {
  const pool = getPool()
  try {
    const [payments] = await pool.execute(`
      SELECT tr.*, c.name AS campaign_name
      FROM theater_revenue tr
      LEFT JOIN campaigns c ON c.id = tr.campaign_id
      WHERE tr.theater_id = ?
      ORDER BY tr.created_at DESC
      LIMIT 50
    `, [req.user.id])
    res.json({ success: true, payments })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── CREATE SUPPORT TICKET ──
async function createTicket(req, res) {
  const pool = getPool()
  try {
    const { subject, message, priority } = req.body
    const ticketId = uuidv4()
    await pool.execute(`
      INSERT INTO support_tickets (id, theater_id, subject, message, priority)
      VALUES (?, ?, ?, ?, ?)
    `, [ticketId, req.user.id, subject, message, priority || 'medium'])
    res.status(201).json({ success: true, message: 'Support ticket created', ticketId })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── GET SUPPORT TICKETS ──
async function getTickets(req, res) {
  const pool = getPool()
  try {
    const [tickets] = await pool.execute(
      'SELECT * FROM support_tickets WHERE theater_id = ? ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json({ success: true, tickets })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── ADMIN: GET ALL THEATERS ──
async function getAllTheaters(req, res) {
  const pool = getPool()
  try {
    const { status, city, state } = req.query
    let query  = 'SELECT * FROM theaters WHERE 1=1'
    const vals = []
    if (status) { query += ' AND status=?'; vals.push(status) }
    if (city)   { query += ' AND city=?';   vals.push(city)   }
    if (state)  { query += ' AND state=?';  vals.push(state)  }
    query += ' ORDER BY created_at DESC'

    const [theaters] = await pool.execute(query, vals)
    res.json({ success: true, count: theaters.length, theaters })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── ADMIN: GET THEATER BY ID ──
async function getTheaterById(req, res) {
  const pool = getPool()
  try {
    const [rows] = await pool.execute('SELECT * FROM theaters WHERE id=?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, theater: rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ── ADMIN: UPDATE STATUS ──
async function updateStatus(req, res) {
  const pool = getPool()
  try {
    const { status } = req.body
    const onboarded = status === 'active' ? ', onboarded_at = NOW()' : ''
    await pool.execute(
      `UPDATE theaters SET status=? ${onboarded} WHERE id=?`,
      [status, req.params.id]
    )
    res.json({ success: true, message: `Theater status updated to ${status}` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  register, login, getMyTheater, updateTheater,
  getScreens, addScreen, updateScreen, deleteScreen,
  getTodaySchedule, getRevenue, getPayments,
  createTicket, getTickets,
  getAllTheaters, getTheaterById, updateStatus,
}
