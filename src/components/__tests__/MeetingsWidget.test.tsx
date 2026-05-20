import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import i18n from 'i18next'
import { MeetingsWidget } from '../MeetingsWidget'

const mockApi = (overrides: Partial<any> = {}) => {
  const api = {
    graphStatus: vi.fn().mockResolvedValue({ configured: true, signedIn: false }),
    graphSignIn: vi.fn(),
    graphSignOut: vi.fn().mockResolvedValue(undefined),
    graphMeetings: vi.fn().mockResolvedValue({ meetings: [] }),
    ...overrides,
  }
  ;(globalThis as any).window.electronAPI = api
  return api
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 3, 19, 10, 0, 0))
})

afterEach(async () => { await i18n.changeLanguage('en') })

describe('<MeetingsWidget />', () => {
  it('renders the not-configured notice when configured=false', async () => {
    mockApi({
      graphStatus: vi.fn().mockResolvedValue({ configured: false, signedIn: false }),
    })
    render(<MeetingsWidget />)
    await waitFor(() => {
      expect(screen.getByText(/Calendar integration not yet configured/i)).toBeInTheDocument()
    })
  })

  it('renders the connect-calendar pitch when configured but not signed in', async () => {
    mockApi()
    render(<MeetingsWidget />)
    await waitFor(() => {
      expect(screen.getByText('Connect your calendar')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Sign in with Microsoft' })).toBeInTheDocument()
  })

  it('renders the SV connect copy when i18n is in Swedish mode', async () => {
    await i18n.changeLanguage('sv')
    mockApi()
    render(<MeetingsWidget />)
    await waitFor(() => {
      expect(screen.getByText('Anslut din kalender')).toBeInTheDocument()
    })
  })

  it('renders the no-meetings empty state when signed in with no upcoming meetings', async () => {
    mockApi({
      graphStatus: vi.fn().mockResolvedValue({ configured: true, signedIn: true }),
      graphMeetings: vi.fn().mockResolvedValue({ meetings: [] }),
    })
    render(<MeetingsWidget />)
    await waitFor(() => {
      expect(screen.getByText(/No meetings coming up/i)).toBeInTheDocument()
    })
  })

  it('renders the next upcoming meeting subject', async () => {
    const startISO = new Date(2026, 3, 19, 11, 0).toISOString()
    const endISO = new Date(2026, 3, 19, 11, 30).toISOString()
    mockApi({
      graphStatus: vi.fn().mockResolvedValue({ configured: true, signedIn: true }),
      graphMeetings: vi.fn().mockResolvedValue({
        meetings: [{
          id: 'm1',
          subject: 'Sprint planning',
          start: { dateTime: startISO, timeZone: 'UTC' },
          end:   { dateTime: endISO,   timeZone: 'UTC' },
        }],
      }),
    })
    render(<MeetingsWidget />)
    await waitFor(() => {
      expect(screen.getByText('Sprint planning')).toBeInTheDocument()
    })
  })

  it('labels an in-progress meeting as "Now"', async () => {
    const startISO = new Date(2026, 3, 19, 9, 55).toISOString()
    const endISO = new Date(2026, 3, 19, 10, 30).toISOString()
    mockApi({
      graphStatus: vi.fn().mockResolvedValue({ configured: true, signedIn: true }),
      graphMeetings: vi.fn().mockResolvedValue({
        meetings: [{
          id: 'm1',
          subject: 'Daily standup',
          start: { dateTime: startISO, timeZone: 'UTC' },
          end:   { dateTime: endISO,   timeZone: 'UTC' },
        }],
      }),
    })
    render(<MeetingsWidget />)
    await waitFor(() => {
      expect(screen.getByText('Now')).toBeInTheDocument()
    })
  })

  it('labels a meeting starting within 5 min as "In N min"', async () => {
    const startISO = new Date(2026, 3, 19, 10, 3).toISOString()
    const endISO = new Date(2026, 3, 19, 10, 30).toISOString()
    mockApi({
      graphStatus: vi.fn().mockResolvedValue({ configured: true, signedIn: true }),
      graphMeetings: vi.fn().mockResolvedValue({
        meetings: [{
          id: 'm1',
          subject: 'Sprint review',
          start: { dateTime: startISO, timeZone: 'UTC' },
          end:   { dateTime: endISO,   timeZone: 'UTC' },
        }],
      }),
    })
    render(<MeetingsWidget />)
    await waitFor(() => {
      expect(screen.getByText('In 3 min')).toBeInTheDocument()
    })
  })
})
