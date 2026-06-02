import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from 'i18next'
import { AppViews } from '../AppViews'
import { AppContextProvider } from '../../lib/AppContext'

function renderInContext(ui: React.ReactElement) {
  return render(
    <AppContextProvider mode="light" lang="en" simonMode={false} username="Test User">
      {ui}
    </AppContextProvider>,
  )
}

function baseProps(overrides: Partial<Parameters<typeof AppViews>[0]> = {}) {
  const noop = vi.fn()
  const asyncNoop = vi.fn(async () => undefined)
  return {
    tab: 'today' as const,
    timer: {
      tCo: '',
      tPr: '',
      tD: '',
      tNote: '',
      tInv: true,
      tSec: 0,
      tRun: false,
      draftId: null,
      setTCo: noop,
      setTPr: noop,
      setTD: noop,
      setTNote: noop,
      setTInv: noop,
      setTRun: noop,
    },
    setActiveTodoId: noop,
    activeTodoId: null,
    accrueTodoHours: noop,
    companies: [],
    projectCache: {},
    companiesError: false,
    projectErrors: {},
    ensureProjects: asyncNoop,
    reloadCompanies: noop,
    isInternalCompany: () => false,
    entries: [],
    entriesLoading: false,
    dayEntries: [],
    dayEntriesLoading: false,
    pendingQueue: [],
    failedQueue: [],
    pendingDeleteId: null,
    setPendingDeleteId: noop,
    todayH: 0,
    liveTodayH: 0,
    liveTodayEntries: [],
    liveDone: false,
    groups: {},
    failedIds: new Set<string>(),
    streak: 0,
    xp: 0,
    unlocked: [],
    weekH: [0, 0, 0, 0, 0],
    weekTotal: 0,
    todayI: 0,
    goal: 8,
    justHitGoal: false,
    justBumpedStreak: false,
    todos: [],
    activeTaskKey: null,
    estimatedTodoFor: () => undefined,
    todoTrackedH: () => 0,
    todoDraft: { text: '', co: '', pr: '', estimate: '', planned: '', deadline: '' },
    setTodoDraft: noop,
    editingTodoId: null,
    addTodo: noop,
    updateTodo: noop,
    resetTodoForm: noop,
    toggleTodo: noop,
    deleteTodo: noop,
    startTodo: noop,
    editTodo: noop,
    saveNewEntry: asyncNoop,
    editEntry: noop,
    delEntry: noop,
    switchTaskGuarded: noop,
    stopAndLogCurrent: asyncNoop,
    cancelTimer: asyncNoop,
    startSideQuest: noop,
    restoreStashedTimer: noop,
    resetTimer: noop,
    stashedTimer: null,
    historyScale: 'day' as const,
    setHistoryScale: noop,
    stepHistoryDate: noop,
    historyIsOnCurrent: true,
    jumpHistoryToCurrent: noop,
    selectedDate: new Date('2026-06-01T12:00:00'),
    setSelectedDate: noop,
    openForNew: noop,
    setTab: noop,
    setTD: noop,
    setLogOpen: noop,
    timerFormOpen: false,
    setTimerFormOpen: noop,
    pendingCancelTimer: false,
    setPendingCancelTimer: noop,
    setConfirmation: noop,
    greetingMsg: '',
    emptyMsg: '',
    timerInsight: '',
    xpCoach: '',
    done: false,
    monthClosure: { ensure: noop, isEnded: () => false, markEnded: noop },
    addFloat: noop,
    openAbsence: noop,
    ...overrides,
  } as Parameters<typeof AppViews>[0]
}

describe('<AppViews />', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('renders TodayView when tab=today', () => {
    renderInContext(<AppViews {...baseProps({ tab: 'today' })} />)
    expect(screen.getByText(/Test|Time tracking/i)).toBeInTheDocument()
  })

  it('renders TimerView when tab=timer', () => {
    renderInContext(<AppViews {...baseProps({ tab: 'timer' })} />)
    expect(screen.getByRole('button', { name: /Start timer/i })).toBeInTheDocument()
  })

  it('renders HistoryView when tab=history', () => {
    renderInContext(<AppViews {...baseProps({ tab: 'history' })} />)
    expect(screen.getAllByRole('tab').length).toBeGreaterThan(0)
  })

  it('renders TodoView when tab=todo', () => {
    renderInContext(<AppViews {...baseProps({ tab: 'todo' })} />)
    expect(screen.getByPlaceholderText('What needs doing?')).toBeInTheDocument()
  })

  it('renders XpView when tab=xp', () => {
    renderInContext(<AppViews {...baseProps({ tab: 'xp' })} />)
    expect(screen.getByText('Developer')).toBeInTheDocument()
  })

  it('routes onLogPastToday: opens log form on timer tab with today seeded', async () => {
    const openForNew = vi.fn()
    const setTab = vi.fn()
    const setLogOpen = vi.fn()
    renderInContext(
      <AppViews
        {...baseProps({ tab: 'today', openForNew, setTab, setLogOpen, liveTodayEntries: [] })}
      />,
    )
    const logPastTime = screen.getByRole('button', { name: /Log past time/i })
    await userEvent.click(logPastTime)
    expect(openForNew).toHaveBeenCalledWith(expect.any(Date))
    expect(setTab).toHaveBeenCalledWith('timer')
    expect(setLogOpen).toHaveBeenCalledWith(true)
  })
})
