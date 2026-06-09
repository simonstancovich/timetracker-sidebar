import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from 'i18next'
import { AppHeader } from '../AppHeader'

function baseProps(overrides: Partial<Parameters<typeof AppHeader>[0]> = {}) {
  return {
    tab: 'today' as const,
    onTabChange: vi.fn(),
    tRun: false,
    tSec: 0,
    todayH: 4,
    goalHours: 8,
    done: false,
    justHitGoal: false,
    clockDate: 'Monday, 1 June',
    clockTime: '08:34',
    showTodo: false,
    onMinimize: vi.fn(),
    petId: 'chick',
    onCyclePet: vi.fn(),
    ...overrides,
  }
}

describe('<AppHeader />', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('renders the clock date and time', () => {
    render(<AppHeader {...baseProps()} />)
    expect(screen.getByText('Monday, 1 June')).toBeInTheDocument()
    expect(screen.getByText('08:34')).toBeInTheDocument()
  })

  it('hides the To-do tab when showTodo is false', () => {
    render(<AppHeader {...baseProps({ showTodo: false })} />)
    expect(screen.getByRole('tab', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Timer' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'History' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'XP' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'To-do' })).toBeNull()
  })

  it('shows the To-do tab when showTodo is true', () => {
    render(<AppHeader {...baseProps({ showTodo: true })} />)
    expect(screen.getByRole('tab', { name: 'To-do' })).toBeInTheDocument()
  })

  it('marks the active tab as selected', () => {
    render(<AppHeader {...baseProps({ tab: 'history' })} />)
    expect(screen.getByRole('tab', { name: 'History' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Today' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onTabChange with the clicked tab value', async () => {
    const onTabChange = vi.fn()
    render(<AppHeader {...baseProps({ onTabChange })} />)
    await userEvent.click(screen.getByRole('tab', { name: 'History' }))
    expect(onTabChange).toHaveBeenCalledWith('history')
  })

  it('routes to the timer tab when the hours ring is clicked', async () => {
    const onTabChange = vi.fn()
    render(<AppHeader {...baseProps({ onTabChange })} />)
    await userEvent.click(screen.getByRole('button', { name: /timer|no timer|paused/i }))
    expect(onTabChange).toHaveBeenCalledWith('timer')
  })

  it('calls onMinimize when the dock-as-top-bar button is clicked', async () => {
    const onMinimize = vi.fn()
    render(<AppHeader {...baseProps({ onMinimize })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dock as top bar' }))
    expect(onMinimize).toHaveBeenCalledOnce()
  })
})
