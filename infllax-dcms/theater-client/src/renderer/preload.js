// ═══════════════════════════════════════════════════════
// INFLLAX DCMS — Electron Preload Script
// File: theater-client/src/renderer/preload.js
// Exposes safe IPC channels to renderer
// ═══════════════════════════════════════════════════════

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Send to main
  getPlaylist:     ()     => ipcRenderer.invoke('get-playlist'),
  reportPlayback:  (data) => ipcRenderer.invoke('report-playback', data),
  manualSync:      ()     => ipcRenderer.invoke('manual-sync'),

  // Receive from main
  onSyncComplete:    (cb) => ipcRenderer.on('sync:complete',     (_, d) => cb(d)),
  onSyncStart:       (cb) => ipcRenderer.on('sync:start',        (_, d) => cb(d)),
  onSyncOffline:     (cb) => ipcRenderer.on('sync:offline',      (_, d) => cb(d)),
  onHeartbeatStatus: (cb) => ipcRenderer.on('heartbeat:status',  (_, d) => cb(d)),
  onScheduleUpdate:  (cb) => ipcRenderer.on('schedule:update',   (_, d) => cb(d)),
  onPlaybackCheck:   (cb) => ipcRenderer.on('playback:check-time',(_, d) => cb(d)),
})
