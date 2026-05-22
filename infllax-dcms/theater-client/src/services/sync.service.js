// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Sync Service
// File: theater-client/src/services/sync.service.js
// PDF: "Content Sync — Downloads scheduled ad content
//       from AWS CDN to local disk automatically"
//      "Offline Cache — Ads stored locally — playback
//       works even if internet drops"
// ═══════════════════════════════════════════════════════

const fs      = require('fs')
const path    = require('path')
const https   = require('https')
const http    = require('http')
const { app } = require('electron')

class SyncService {
  constructor(config, mainWindow) {
    this.config      = config
    this.mainWindow  = mainWindow
    this.playlist    = []
    this.cacheDir    = path.join(app.getPath('userData'), 'ad-cache')
    this.playlistFile = path.join(app.getPath('userData'), 'playlist.json')

    // Ensure cache directory exists
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true })
    }

    // Load cached playlist if exists (offline mode)
    if (fs.existsSync(this.playlistFile)) {
      try {
        this.playlist = JSON.parse(fs.readFileSync(this.playlistFile, 'utf-8'))
        console.log(`📦 Loaded ${this.playlist.length} slots from cache`)
      } catch (e) {
        this.playlist = []
      }
    }
  }

  // ── SYNC PLAYLIST FROM BACKEND API ──
  async syncPlaylist() {
    if (!this.config.theater_id) {
      console.log('⚠️ No theater_id configured. Skipping sync.')
      return false
    }

    try {
      console.log('🔄 Syncing playlist from backend...')
      this._sendToRenderer('sync:start', {})

      const res  = await fetch(
        `${this.config.api_url}/api/schedule/playlist/${this.config.theater_id}`
      )
      const data = await res.json()

      if (!data.success) throw new Error(data.message)

      this.playlist = data.playlist

      // Save to local cache (offline fallback)
      fs.writeFileSync(this.playlistFile, JSON.stringify(this.playlist, null, 2))
      console.log(`✅ Playlist synced: ${this.playlist.length} slots for today`)

      // Download ad videos to local cache (CDN → local disk)
      await this._downloadVideos()

      this._sendToRenderer('sync:complete', {
        count:    this.playlist.length,
        date:     data.date,
        playlist: this.playlist,
      })

      return true

    } catch (err) {
      console.error('❌ Sync failed:', err.message)
      console.log('📦 Using cached playlist (offline mode)')
      this._sendToRenderer('sync:offline', { playlist: this.playlist })
      return false
    }
  }

  // ── DOWNLOAD AD VIDEOS TO LOCAL DISK ──
  // PDF: "Offline Cache — Ads stored locally —
  //       playback works even if internet drops"
  async _downloadVideos() {
    for (const slot of this.playlist) {
      if (!slot.video_url) continue

      const filename  = `${slot.campaign_id}.mp4`
      const localPath = path.join(this.cacheDir, filename)

      // Skip if already cached
      if (fs.existsSync(localPath)) {
        slot.local_path = localPath
        console.log(`✅ Cache hit: ${slot.campaign_name}`)
        continue
      }

      // Download from AWS CloudFront CDN
      try {
        console.log(`⬇️ Downloading: ${slot.campaign_name}`)
        await this._downloadFile(slot.video_url, localPath)
        slot.local_path = localPath
        console.log(`✅ Downloaded: ${slot.campaign_name}`)
        this._sendToRenderer('sync:video-downloaded', { name: slot.campaign_name })
      } catch (e) {
        console.error(`❌ Download failed for ${slot.campaign_name}:`, e.message)
        // Keep CDN URL as fallback
        slot.local_path = slot.video_url
      }
    }
  }

  // ── FILE DOWNLOAD HELPER ──
  _downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
      const file   = fs.createWriteStream(dest)
      const client = url.startsWith('https') ? https : http

      client.get(url, (res) => {
        res.pipe(file)
        file.on('finish', () => { file.close(); resolve() })
      }).on('error', (err) => {
        fs.unlink(dest, () => {})
        reject(err)
      })
    })
  }

  getCurrentPlaylist() { return this.playlist }

  getCachedVideoPath(campaignId) {
    const localPath = path.join(this.cacheDir, `${campaignId}.mp4`)
    return fs.existsSync(localPath) ? localPath : null
  }

  // Clear old cache (videos older than 7 days)
  clearOldCache() {
    const files   = fs.readdirSync(this.cacheDir)
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)

    files.forEach(file => {
      const filepath = path.join(this.cacheDir, file)
      const stat     = fs.statSync(filepath)
      if (stat.mtimeMs < weekAgo) {
        fs.unlinkSync(filepath)
        console.log(`🗑️ Cleared old cache: ${file}`)
      }
    })
  }

  _sendToRenderer(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data)
    }
  }
}

module.exports = SyncService
