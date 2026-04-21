import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TabList } from './TabList'

describe('<TabList />', () => {
  it('renders as role="tablist"', () => {
    render(
      <TabList>
        <button role="tab">a</button>
      </TabList>,
    )
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('forwards aria-label and other HTML attributes', () => {
    render(
      <TabList aria-label="Views" data-testid="tl">
        <button role="tab">a</button>
      </TabList>,
    )
    const el = screen.getByTestId('tl')
    expect(el).toHaveAttribute('aria-label', 'Views')
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(
      <TabList className="extra">
        <button role="tab">a</button>
      </TabList>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('renders children inside', () => {
    render(
      <TabList>
        <button role="tab">Today</button>
        <button role="tab">Timer</button>
      </TabList>,
    )
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })
})
