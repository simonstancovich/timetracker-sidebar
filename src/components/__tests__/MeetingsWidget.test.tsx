import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MeetingsWidget } from '../MeetingsWidget'

const M = {
  bg: '#fff', s1: '#fff', s2: '#eee', b1: '#ccc', b2: '#aaa',
  t1: '#000', t2: '#333', t3: '#666',
  ac: '#7c3aed', ad: '#eee', at: '#000',
  btn: '#7c3aed', pk: '#be185d', gn: '#16a34a',
  bsh: '0 4px 14px rgba(0,0,0,0.2)',
  // tf is referenced inside the widget
  tf: '#999',
}

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

describe('<MeetingsWidget />', () => {
  it('renders the not-configured notice when configured=false', async () => {
    mockApi({
      graphStatus: vi.fn().mockResolvedValue({ configured: false, signedIn: false }),
    })
    render(<MeetingsWidget M={M as any} />)
    await waitFor(() => {
      expect(screen.getByText(/Calendar integration not yet configured/i)).toBeInTheDocument()
    })
  })

  it('renders the connect-calendar pitch when configured but not signed in', async () => {
    mockApi()
    render(<MeetingsWidget M={M as any} />)
    await waitFor(() => {
      expect(screen.getByText('Connect your calendar')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Sign in with Microsoft' })).toBeInTheDocument()
  })

  it('renders the SV connect copy when lang=sv', async () => {
    mockApi()
    render(<MeetingsWidget M={M as any} lang="sv" />)
    await waitFor(() => {
      expect(screen.getByText('Anslut din kalender')).toBeInTheDocument()
    })
  })

  it('renders the no-meetings empty state when signed in with no upcoming meetings', async () => {
    mockApi({
      graphStatus: vi.fn().mockResolvedValue({ configured: true, signedIn: true }),
      graphMeetings: vi.fn().mockResolvedValue({ meetings: [] }),
    })
    render(<MeetingsWidget M={M as any} />)
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
    render(<MeetingsWidget M={M as any} />)
    await waitFor(() => {
      expect(screen.getByText('Sprint planning')).toBeInTheDocument()
    })
  })
})
