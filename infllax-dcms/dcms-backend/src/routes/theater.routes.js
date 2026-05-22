// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Theater Routes
// File: dcms-backend/src/routes/theater.routes.js
// Stack: Node.js + Express + MySQL
// ═══════════════════════════════════════════════════════

const express = require('express')
const router  = express.Router()
const { verifyToken, theaterOwnerOnly, adminOnly } = require('../middleware/auth.middleware')
const theaterController = require('../controllers/theater.controller')

// ── PUBLIC ──
router.post('/register',       theaterController.register)
router.post('/login',          theaterController.login)

// ── THEATER OWNER (protected) ──
router.get   ('/me',           verifyToken, theaterOwnerOnly, theaterController.getMyTheater)
router.put   ('/me',           verifyToken, theaterOwnerOnly, theaterController.updateTheater)
router.get   ('/screens',      verifyToken, theaterOwnerOnly, theaterController.getScreens)
router.post  ('/screens',      verifyToken, theaterOwnerOnly, theaterController.addScreen)
router.put   ('/screens/:id',  verifyToken, theaterOwnerOnly, theaterController.updateScreen)
router.delete('/screens/:id',  verifyToken, theaterOwnerOnly, theaterController.deleteScreen)
router.get   ('/schedule',     verifyToken, theaterOwnerOnly, theaterController.getTodaySchedule)
router.get   ('/revenue',      verifyToken, theaterOwnerOnly, theaterController.getRevenue)
router.get   ('/payments',     verifyToken, theaterOwnerOnly, theaterController.getPayments)
router.post  ('/support',      verifyToken, theaterOwnerOnly, theaterController.createTicket)
router.get   ('/support',      verifyToken, theaterOwnerOnly, theaterController.getTickets)

// ── ADMIN (protected) ──
router.get   ('/',             verifyToken, adminOnly, theaterController.getAllTheaters)
router.get   ('/:id',          verifyToken, adminOnly, theaterController.getTheaterById)
router.put   ('/:id/status',   verifyToken, adminOnly, theaterController.updateStatus)

module.exports = router
