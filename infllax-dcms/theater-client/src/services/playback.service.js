// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Playback Service
// File: theater-client/src/services/playback.service.js
// PDF: "Playback Engine — Plays each ad at exact scheduled
//       time on the theater screen"
//      "Playback Log Reporter — Reports every single ad
//       play with timestamp and duration"
//      "Auto-restart — App restarts automatically if crash
//       detected — zero manual intervention"
// ═══════════════════════════════════════════════════════

const os = require('os')

class PlaybackService {
  constructor(config, mainWindow) {
    this.config     = config
    this.mainWindow = mainWindow
    this.scheduler  = null
    this.isPlaying  = false
    this.currentAd  = null
  }

  start() {
    // Check every 10 seconds for scheduled ads
    this.scheduler = setInterval(() => {
      this._checkSchedule()
    }, 10 * 1000) // 10 seconds

    // Also check immediately
    this._checkSchedule()
    console.log('▶️ Playback scheduler started')
  }

  stop() {
    if (this.scheduler) clearInterval(this.scheduler)
    console.log('⏹️ Playback scheduler stopped')
  }

  // ── CHECK IF ANY AD SHOULD PLAY RIGHT NOW ──
  _checkSchedule() {
    // Get playlist from renderer via IPC
    this._sendToRenderer('playback:check-time', { now: new Date().toISOString() })
  }

  // ── REPORT AD PLAY TO BACKEND ──
  // Called by renderer after ad finishes
  async reportPlay(logData) {
    const payload = {
      schedule_id:  logData.schedule_id,
      campaign_id:  logData.campaign_id,
      theater_id:   this.config.theater_id,
      screen_id:    logData.screen_id || null,
      played_at:    logData.played_at || new Date().toISOString(),
      duration_sec: logData.duration_sec,
      completed:    logData.completed !== false,
      device_info: {
        platform:    os.platform(),
        hostname:    os.hostname(),
        app_version: this.config.app_version,
      },
    }

    try {
      const res = await fetch(`${this.config.api_url}/api/schedule/playback/log`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      console.log(`✅ Playback logged: ${logData.campaign_id} at ${logData.played_at}`)
      this._sendToRenderer('playback:logged', { success: true, logId: data.logId })
      return true
    } catch (err) {
      // Store failed logs locally — retry on next sync
      console.error('❌ Playback report failed:', err.message)
      this._storeOfflineLog(payload)
      return false
    }
  }

  // ── STORE OFFLINE LOG (if network down) ──
  _storeOfflineLog(payload) {
    try {
      const { app }    = require('electron')
      const path       = require('path')
      const fs         = require('fs')
      const logFile    = path.join(app.getPath('userData'), 'offline-logs.json')
      const existing   = fs.existsSync(logFile)
        ? JSON.parse(fs.readFileSync(logFile, 'utf-8'))
        : []
      existing.push({ ...payload, _offline: true, _timestamp: Date.now() })
      fs.writeFileSync(logFile, JSON.stringify(existing, null, 2))
      console.log('💾 Playback log stored offline for later sync')
    } catch (e) {
      console.error('Failed to store offline log:', e.message)
    }
  }

  // ── RETRY OFFLINE LOGS ──
  async retryOfflineLogs() {
    try {
      const { app }  = require('electron')
      const path     = require('path')
      const fs       = require('fs')
      const logFile  = path.join(app.getPath('userData'), 'offline-logs.json')
      if (!fs.existsSync(logFile)) return

      const logs  = JSON.parse(fs.readFileSync(logFile, 'utf-8'))
      const failed = []

      for (const log of logs) {
        const { _offline, _timestamp, ...payload } = log
        try {
          await fetch(`${this.config.api_url}/api/schedule/playback/log`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
          })
        } catch {
          failed.push(log)
        }
      }

      fs.writeFileSync(logFile, JSON.stringify(failed, null, 2))
      console.log(`✅ Retried offline logs: ${logs.length - failed.length} synced`)
    } catch (e) {
      console.error('Retry offline logs failed:', e.message)
    }
  }

  _sendToRenderer(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data)
    }
  }
}

module.exports = PlaybackService
