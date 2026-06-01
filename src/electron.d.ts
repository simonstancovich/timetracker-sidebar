import type { CurrentUser } from './lib/useCurrentUser'
import type { Todo } from './lib/todos'
import type { PendingEntry } from './lib/pendingEntries'
import type { AchStats } from './lib/achievements'
import type { StoredLogForm } from './lib/useLogForm'

declare global {
  interface StoreSchema {
    mode: 'light' | 'dark'
    lang: 'en' | 'sv'
    pinned: boolean
    currentUser: CurrentUser
    intro_seen: boolean
    xp: number
    unlocked: string[]
    streak: number
    lastLoggedDate: string
    lastCelebratedDate: string
    achStats: AchStats
    simonMode: boolean
    todos: Todo[]
    pendingEntries: PendingEntry[]
    failedEntries: PendingEntry[]
    logForm: StoredLogForm
  }

  interface ApiCallResult<T> {
    data?: T
    error?: string
  }

  interface ElectronAPI {
    checkAuth: () => Promise<boolean>
    ping: () => Promise<{ reachable: boolean }>
    login: (creds: { username: string; password: string }) => Promise<{ success: boolean; error?: string }>
    openAuth: () => Promise<void>
    signOut: () => Promise<void>
    onAuthSuccess: (cb: () => void) => () => void
    onSignedOut: (cb: () => void) => () => void
    onSessionLost: (cb: () => void) => () => void
    apiCall: <T = unknown>(
      params: Record<string, string>,
      body: Record<string, string> | null,
    ) => Promise<ApiCallResult<T>>
    storeGet: {
      <K extends keyof StoreSchema>(key: K): Promise<StoreSchema[K] | undefined>
      (key: string): Promise<unknown>
    }
    storeSet: {
      <K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): Promise<void>
      (key: string, value: unknown): Promise<void>
    }
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
