interface ElectronAPI {
  checkAuth: () => Promise<boolean>
  openAuth: () => Promise<void>
  signOut: () => Promise<void>
  onAuthSuccess: (cb: () => void) => void
  onSignedOut: (cb: () => void) => void
  onSessionLost: (cb: () => void) => void
  apiCall: (params: Record<string, string>, body: Record<string, string> | null) => Promise<{ data?: any; error?: string }>
  storeGet: (key: string) => Promise<any>
  storeSet: (key: string, value: any) => Promise<void>
  setSize: (size: 'full' | 'pill' | 'square') => Promise<void>
  onForcedSize: (cb: (size: 'full' | 'pill' | 'square') => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
