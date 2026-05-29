import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { TabList } from './TabList'
import * as s from './TabList.css'

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

  it('defaults to horizontal (no aria-orientation set)', () => {
    render(
      <TabList>
        <button role="tab">a</button>
      </TabList>,
    )
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBeNull()
  })

  it('sets aria-orientation and vertical class when vertical', () => {
    render(
      <TabList orientation="vertical">
        <button role="tab">a</button>
      </TabList>,
    )
    const el = screen.getByRole('tablist')
    expect(el.getAttribute('aria-orientation')).toBe('vertical')
    expect(el.className).toContain(s.vertical)
  })

  it('ArrowRight moves focus to the next tab (horizontal)', () => {
    render(
      <TabList>
        <button role="tab">a</button>
        <button role="tab">b</button>
        <button role="tab">c</button>
      </TabList>,
    )
    const [a, b] = screen.getAllByRole('tab')
    a.focus()
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })
    expect(document.activeElement).toBe(b)
  })

  it('ArrowLeft wraps to the last tab from the first', () => {
    render(
      <TabList>
        <button role="tab">a</button>
        <button role="tab">b</button>
        <button role="tab">c</button>
      </TabList>,
    )
    const tabs = screen.getAllByRole('tab')
    tabs[0].focus()
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(tabs[2])
  })

  it('Home focuses the first tab, End focuses the last', () => {
    render(
      <TabList>
        <button role="tab">a</button>
        <button role="tab">b</button>
        <button role="tab">c</button>
      </TabList>,
    )
    const tabs = screen.getAllByRole('tab')
    tabs[1].focus()
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'End' })
    expect(document.activeElement).toBe(tabs[2])
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'Home' })
    expect(document.activeElement).toBe(tabs[0])
  })

  it('ArrowDown moves to the next tab when vertical', () => {
    render(
      <TabList orientation="vertical">
        <button role="tab">a</button>
        <button role="tab">b</button>
      </TabList>,
    )
    const tabs = screen.getAllByRole('tab')
    tabs[0].focus()
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowDown' })
    expect(document.activeElement).toBe(tabs[1])
  })

  it('skips disabled tabs', () => {
    render(
      <TabList>
        <button role="tab">a</button>
        <button role="tab" aria-disabled="true">b</button>
        <button role="tab">c</button>
      </TabList>,
    )
    const tabs = screen.getAllByRole('tab')
    tabs[0].focus()
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tabs[2])
  })
})
