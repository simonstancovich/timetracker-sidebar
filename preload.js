const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  checkAuth: () => ipcRenderer.invoke('check-auth'),
  openAuth: () => ipcRenderer.invoke('open-auth'),
  signOut: () => ipcRenderer.invoke('sign-out'),
  onAuthSuccess: (cb) => ipcRenderer.on('auth-success', cb),
  onSignedOut: (cb) => ipcRenderer.on('signed-out', cb),
  onSessionLost: (cb) => ipcRenderer.on('session-lost', cb),

  // API proxy — all calls go through main process (inherits session cookies)
  apiCall: (params, body) => ipcRenderer.invoke('api-call', { params, body }),

  // Persistent local store
  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),

  // Window
  setSize: (size) => ipcRenderer.invoke('set-size', size),
  onForcedSize: (cb) => ipcRenderer.on('forced-size', (_e, s) => cb(s)),
})
