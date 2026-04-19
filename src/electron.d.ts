declare global {
  interface ElectronAPI {
    checkAuth: () => Promise<boolean>
    openAuth: () => Promise<void>
    signOut: () => Promise<void>
    onAuthSuccess: (cb: () => void) => () => void
    onSignedOut: (cb: () => void) => () => void
    onSessionLost: (cb: () => void) => () => void
    apiCall: (params: Record<string, string>, body: Record<string, string> | null) => Promise<{ data?: any; error?: string }>
    storeGet: (key: string) => Promise<any>
    storeSet: (key: string, value: any) => Promise<void>
    setSize: (size: 'full' | 'top') => Promise<void>
    onForcedSize: (cb: (size: 'full' | 'top') => void) => () => void
    setBlurCollapseDisabled: (disabled: boolean) => Promise<void>

    graphStatus: () => Promise<GraphStatus>
    graphSignIn: () => Promise<{ username?: string; name?: string; error?: string }>
    graphSignOut: () => Promise<void>
    graphMeetings: (opts?: { hoursBack?: number; hoursForward?: number }) =>
      Promise<{ meetings?: GraphMeeting[]; error?: string }>
    onGraphDeviceCode: (cb: (code: { userCode: string; verificationUri: string; message: string }) => void) => () => void
  }

  interface GraphStatus {
    configured: boolean
    signedIn: boolean
    username?: string | null
    name?: string | null
  }

  interface GraphMeeting {
    id: string
    subject: string
    start: { dateTime: string; timeZone: string }
    end: { dateTime: string; timeZone: string }
    organizer?: { emailAddress?: { name?: string; address?: string } }
    attendees?: Array<{ emailAddress?: { name?: string; address?: string }; type?: string }>
    isAllDay?: boolean
    isCancelled?: boolean
    showAs?: string
    bodyPreview?: string
    webLink?: string
    onlineMeeting?: { joinUrl?: string } | null
  }

  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
