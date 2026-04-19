const { contextBridge, ipcRenderer } = require('electron')

const subscribe = (channel, mapArgs) => (cb) => {
  const listener = mapArgs ? (_e, ...args) => cb(mapArgs(...args)) : () => cb()
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  checkAuth: () => ipcRenderer.invoke('check-auth'),
  openAuth: () => ipcRenderer.invoke('open-auth'),
  signOut: () => ipcRenderer.invoke('sign-out'),
  onAuthSuccess: subscribe('auth-success'),
  onSignedOut: subscribe('signed-out'),
  onSessionLost: subscribe('session-lost'),

  // API proxy — all calls go through main process (inherits session cookies)
  apiCall: (params, body) => ipcRenderer.invoke('api-call', { params, body }),

  // Persistent local store
  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),

  // Window
  setSize: (size) => ipcRenderer.invoke('set-size', size),
  onForcedSize: subscribe('forced-size', (s) => s),
  setBlurCollapseDisabled: (disabled) => ipcRenderer.invoke('set-blur-collapse-disabled', disabled),

  // Microsoft Graph (calendar)
  graphStatus: () => ipcRenderer.invoke('graph-status'),
  graphSignIn: () => ipcRenderer.invoke('graph-sign-in'),
  graphSignOut: () => ipcRenderer.invoke('graph-sign-out'),
  graphMeetings: (opts) => ipcRenderer.invoke('graph-meetings', opts),
  onGraphDeviceCode: subscribe('graph-device-code', (code) => code),
})
