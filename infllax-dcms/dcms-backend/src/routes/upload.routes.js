// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Upload Route (AWS S3)
// File: dcms-backend/src/routes/upload.routes.js
// PDF: "AWS S3 — Ad video files, images, assets storage"
//      "AWS CloudFront CDN — Fast content delivery to theaters"
// ═══════════════════════════════════════════════════════

const express = require('express')
const router  = express.Router()
const multer  = require('multer')
const AWS     = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const { verifyToken, advertiserOnly } = require('../middleware/auth.middleware')
const { getPool } = require('../config/db.config')

// ── AWS S3 Config ──
const s3 = new AWS.S3({
  accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region:          process.env.AWS_REGION || 'ap-south-1', // Mumbai
})

const BUCKET     = process.env.S3_BUCKET      || 'infllax-dcms-ads'
const CDN_DOMAIN = process.env.CLOUDFRONT_URL || `https://${BUCKET}.s3.ap-south-1.amazonaws.com`

// ── Multer — memory storage (uploads to S3 directly) ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 200 * 1024 * 1024 }, // 200MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only MP4, WebM, JPEG, PNG, WebP files allowed'))
    }
  },
})

// ── UPLOAD AD VIDEO ──
router.post('/ad-video', verifyToken, advertiserOnly, upload.single('video'), async (req, res) => {
  const pool = getPool()
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const fileExt  = req.file.originalname.split('.').pop()
    const fileName = `ads/videos/${req.user.id}/${uuidv4()}.${fileExt}`

    // Upload to S3
    const s3Result = await s3.upload({
      Bucket:      BUCKET,
      Key:         fileName,
      Body:        req.file.buffer,
      ContentType: req.file.mimetype,
      ACL:         'public-read',
    }).promise()

    // CloudFront URL (PDF: "CDN Fast content delivery to all theaters")
    const cdnUrl = `${CDN_DOMAIN}/${fileName}`

    // Update campaign video_url if campaign_id provided
    const { campaign_id } = req.body
    if (campaign_id) {
      await pool.execute(
        'UPDATE campaigns SET video_url=? WHERE id=? AND advertiser_id=?',
        [cdnUrl, campaign_id, req.user.id]
      )
    }

    res.json({
      success:  true,
      url:      cdnUrl,
      s3Key:    fileName,
      size:     req.file.size,
      mimeType: req.file.mimetype,
    })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ success: false, message: 'Upload failed: ' + err.message })
  }
})

// ── UPLOAD THUMBNAIL ──
router.post('/thumbnail', verifyToken, advertiserOnly, upload.single('thumbnail'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file' })

    const fileExt  = req.file.originalname.split('.').pop()
    const fileName = `ads/thumbnails/${req.user.id}/${uuidv4()}.${fileExt}`

    await s3.upload({
      Bucket:      BUCKET,
      Key:         fileName,
      Body:        req.file.buffer,
      ContentType: req.file.mimetype,
      ACL:         'public-read',
    }).promise()

    const cdnUrl = `${CDN_DOMAIN}/${fileName}`
    res.json({ success: true, url: cdnUrl })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed' })
  }
})

module.exports = router
