// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — JWT + RBAC Auth Middleware
// File: dcms-backend/src/middleware/auth.middleware.js
// Stack: JWT + RBAC (as per PDF: "Secure login tokens —
//        role-based access: Founder, Admin, Creator, User")
// ═══════════════════════════════════════════════════════

const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'infllax_dcms_secret_change_in_production'

// ── Generate JWT Token ──
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

// ── Verify JWT Token Middleware ──
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token      = authHeader && authHeader.split(' ')[1] // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' })
  }
}

// ── RBAC — Role-Based Access Control ──
// Roles: founder | admin | theater_owner | advertiser
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      })
    }
    next()
  }
}

// ── Theater Owner Only ──
const theaterOwnerOnly = requireRole('theater_owner', 'admin', 'founder')

// ── Advertiser Only ──
const advertiserOnly = requireRole('advertiser', 'admin', 'founder')

// ── Admin + Founder Only ──
const adminOnly = requireRole('admin', 'founder')

// ── Founder Only ──
const founderOnly = requireRole('founder')

module.exports = {
  generateToken,
  verifyToken,
  requireRole,
  theaterOwnerOnly,
  advertiserOnly,
  adminOnly,
  founderOnly,
}
