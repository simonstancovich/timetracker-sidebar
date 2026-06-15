import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import i18n from 'i18next'
import { AchievementToast } from '../AchievementToast'
import type { Ach } from '../../lib/achievements'
import * as s from '../AchievementToast.css'

const ach: Ach = { id: 'first', e: '🎯', xp: 50, tone: 'milestone' }

describe('<AchievementToast />', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('renders nothing when ach is null', () => {
    const { container } = render(<AchievementToast ach={null} lang="en" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders with role="status" and aria-live="polite" for screen readers', () => {
    render(<AchievementToast ach={ach} lang="en" />)
    const el = screen.getByRole('status')
    expect(el).toHaveAttribute('aria-live', 'polite')
  })

  it('renders the achievement emoji, unlock label and the XP badge', () => {
    render(<AchievementToast ach={ach} lang="en" />)
    expect(screen.getByText('🎯')).toBeInTheDocument()
    expect(screen.getByText('Achievement unlocked')).toBeInTheDocument()
    expect(screen.getByText('+50 XP')).toBeInTheDocument()
  })

  it('applies the brand tone class that drives its accent colour', () => {
    render(<AchievementToast ach={ach} lang="en" />)
    const el = screen.getByRole('status')
    expect(el.className).toContain(s.tone.milestone)
  })
})
