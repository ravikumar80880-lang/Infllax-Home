// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Theater Client App (Electron.js)
// File: theater-client/src/main/main.js
// Stack: Electron.js (as per PDF: "Theater Client Application —
//        Lightweight software installed at each theater")
// Platform: Windows / Linux (as per PDF)
// ═══════════════════════════════════════════════════════

const { app, BrowserWindow, ipcMain, powerSaveBlocker } = require('electron')
const path   = require('path')
const fs     = require('fs')
const http   = require('http')
const https  = require('https')

// ── Services ──
const HeartbeatService = require('../services/heartbeat.service')
const PlaybackService  = require('../services/playback.service')
const SyncService      = require('../services/sync.service')
const CacheService     = require('../services/cache.service')

let mainWindow
let heartbeatService
let playbackService
let syncService

// ── Prevent screen from sleeping during ad playback ──
let powerBlockId = null

// ═══════════════════════════════════════
// CREATE MAIN WINDOW
// ═══════════════════════════════════════
function createWindow() {
  mainWindow = new BrowserWindow({
    width:           1920,
    height:          1080,
    fullscreen:      true,        // Theater screen = fullscreen
    kiosk:           true,        // Kiosk mode — prevents exit
    frame:           false,       // No title bar
    backgroundColor: '#04080f',
    webPreferences: {
      nodeIntegration:    false,
      contextIsolation:   true,
      preload:            path.join(__dirname, '../renderer/preload.js'),
    },
  })

  // Load renderer (HTML/JS player UI)
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))

  // Prevent right-click context menu
  mainWindow.webContents.on('context-menu', (e) => e.preventDefault())

  // Open DevTools only in dev mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

// ═══════════════════════════════════════
// APP READY
// ═══════════════════════════════════════
app.whenReady().then(async () => {
  // Block system sleep during ad playback
  powerBlockId = powerSaveBlocker.start('prevent-display-sleep')

  createWindow()

  // Read theater config
  const config = readConfig()

  // Init services
  heartbeatService = new HeartbeatService(config, mainWindow)
  playbackService  = new PlaybackService(config, mainWindow)
  syncService      = new SyncService(config, mainWindow)

  // Start heartbeat — every 60 seconds as per PDF
  heartbeatService.start()

  // Sync today's playlist on startup
  await syncService.syncPlaylist()

  // Start playback scheduler
  playbackService.start()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  if (powerBlockId !== null) powerSaveBlocker.stop(powerBlockId)
  if (heartbeatService) heartbeatService.stop()
  if (playbackService)  playbackService.stop()
})

// ═══════════════════════════════════════
// IPC HANDLERS
// ═══════════════════════════════════════

// Renderer requests current playlist
ipcMain.handle('get-playlist', async () => {
  return syncService ? syncService.getCurrentPlaylist() : []
})

// Renderer reports ad played
ipcMain.handle('report-playback', async (event, logData) => {
  return playbackService ? playbackService.reportPlay(logData) : false
})

// Renderer requests manual sync
ipcMain.handle('manual-sync', async () => {
  return syncService ? syncService.syncPlaylist() : false
})

// ═══════════════════════════════════════
// CONFIG READER
// Reads theater_id and API URL from local config file
// ═══════════════════════════════════════
function readConfig() {
  const configPath = path.join(app.getPath('userData'), 'infllax-config.json')

  if (!fs.existsSync(configPath)) {
    // Default config — theater must configure on first run
    const defaultConfig = {
      theater_id:  '',
      api_url:     'http://localhost:5000',
      app_version: app.getVersion(),
    }
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
    return defaultConfig
  }

  return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
}

module.exports = { createWindow }
