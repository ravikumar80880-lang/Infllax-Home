// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Campaign Routes
// File: dcms-backend/src/routes/campaign.routes.js
// ═══════════════════════════════════════════════════════

const express = require('express')
const router  = express.Router()
const { verifyToken, advertiserOnly, adminOnly } = require('../middleware/auth.middleware')
const ctrl = require('../controllers/campaign.controller')

// Advertiser routes
router.post  ('/',              verifyToken, advertiserOnly, ctrl.createCampaign)
router.get   ('/',              verifyToken, advertiserOnly, ctrl.getMyCampaigns)
router.get   ('/:id',          verifyToken, advertiserOnly, ctrl.getCampaignById)
router.put   ('/:id',          verifyToken, advertiserOnly, ctrl.updateCampaign)
router.post  ('/:id/pay',      verifyToken, advertiserOnly, ctrl.initPayment)
router.post  ('/:id/pay/verify', verifyToken, advertiserOnly, ctrl.verifyPayment)
router.get   ('/:id/analytics', verifyToken, advertiserOnly, ctrl.getCampaignAnalytics)
router.get   ('/:id/theaters', verifyToken, advertiserOnly, ctrl.getCampaignTheaters)
router.post  ('/:id/theaters', verifyToken, advertiserOnly, ctrl.assignTheaters)

// Admin routes
router.get   ('/admin/all',    verifyToken, adminOnly, ctrl.getAllCampaigns)
router.put   ('/:id/approve',  verifyToken, adminOnly, ctrl.approveCampaign)
router.put   ('/:id/reject',   verifyToken, adminOnly, ctrl.rejectCampaign)

module.exports = router
