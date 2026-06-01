import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from 'i18next'
import { AppTopBar } from '../AppTopBar'
import * as s from '../AppTopBar.css'

const companies = [{ id: 'c1', name: 'DevCore' }]
const projectCache = { c1: [{ id: 'p1', name: 'Backend' }] }

function baseProps(overrides: Partial<Parameters<typeof AppTopBar>[0]> = {}) {
  return {
    themeClass: 'theme-x',
    mode: 'light' as const,
    setMode: vi.fn(),
    lang: 'en' as const,
    goSize: vi.fn(),
    modeOverlay: null,
    tRun: false,
    setTRun: vi.fn(),
    tSec: 0,
    funMessage: null,
    windowFocused: true,
    sessionXp: 12,
    xpBump: null,
    justBumpedStreak: false,
    todayH: 3.5,
    streak: 4,
    weekH: [4, 6, 8, 3, 0],
    goal: 8,
    done: false,
    gpct: 44,
    companies,
    projectCache,
    tCo: '',
    tPr: '',
    topEstLiveH: 0,
    ...overrides,
  }
}

describe('<AppTopBar />', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('renders the clock and session-xp display', () => {
    render(<AppTopBar {...baseProps({ tSec: 65 })} />)
    expect(screen.getByText('+12')).toBeInTheDocument()
    expect(screen.getByText('xp')).toBeInTheDocument()
  })

  it('paints the left pane orange when paused with time on the clock', () => {
    const { container } = render(<AppTopBar {...baseProps({ tRun: false, tSec: 120 })} />)
    expect(container.querySelector(`.${s.leftBg.pausedWithTime}`)).toBeInTheDocument()
  })

  it('paints the left pane red when paused with no time accumulated', () => {
    const { container } = render(<AppTopBar {...baseProps({ tRun: false, tSec: 0 })} />)
    expect(container.querySelector(`.${s.leftBg.pausedNoTime}`)).toBeInTheDocument()
  })

  it('paints the left pane with running bg when timer is running', () => {
    const { container } = render(<AppTopBar {...baseProps({ tRun: true })} />)
    expect(container.querySelector(`.${s.leftBg.running}`)).toBeInTheDocument()
  })

  it('toggles tRun when the play/pause button is clicked', async () => {
    const setTRun = vi.fn()
    render(<AppTopBar {...baseProps({ tRun: false, setTRun })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(setTRun).toHaveBeenCalledOnce()
    const fn = setTRun.mock.calls[0]![0] as (v: boolean) => boolean
    expect(fn(false)).toBe(true)
  })

  it('shows the pause label when running', () => {
    render(<AppTopBar {...baseProps({ tRun: true })} />)
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })

  it('renders co/project names when running with a selected task', () => {
    render(<AppTopBar {...baseProps({ tRun: true, tCo: 'c1', tPr: 'p1' })} />)
    expect(screen.getByText('DevCore')).toBeInTheDocument()
    expect(screen.getByText('· Backend')).toBeInTheDocument()
  })

  it('shows the funMessage when running', () => {
    render(<AppTopBar {...baseProps({ tRun: true, tCo: 'c1', tPr: 'p1', funMessage: 'keep going' })} />)
    expect(screen.getByText(/keep going/)).toBeInTheDocument()
  })

  it('toggles mode via the round mode button', async () => {
    const setMode = vi.fn()
    render(<AppTopBar {...baseProps({ mode: 'light', setMode })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark' }))
    expect(setMode).toHaveBeenCalledWith('dark')
  })

  it('calls goSize("full") when the Open pill is clicked', async () => {
    const goSize = vi.fn()
    render(<AppTopBar {...baseProps({ goSize })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Open sidebar' }))
    expect(goSize).toHaveBeenCalledWith('full')
  })

  it('calls goSize("full") on outer double-click', async () => {
    const goSize = vi.fn()
    render(<AppTopBar {...baseProps({ goSize })} />)
    await userEvent.dblClick(screen.getByTitle('Double-click to open full sidebar'))
    expect(goSize).toHaveBeenCalledWith('full')
  })
})
