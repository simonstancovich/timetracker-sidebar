import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabButton } from './TabButton'
import * as s from './TabButton.css'

describe('<TabButton />', () => {
  it('renders as a role="tab" button of type "button"', () => {
    render(<TabButton selected={false}>Today</TabButton>)
    const btn = screen.getByRole('tab', { name: 'Today' })
    expect(btn).toHaveAttribute('type', 'button')
  })

  it('reflects `selected` in aria-selected and the selected-state class', () => {
    const { rerender, container } = render(<TabButton selected>Today</TabButton>)
    const btn = container.querySelector('button')!
    expect(btn.getAttribute('aria-selected')).toBe('true')
    expect(btn.className).toContain(s.state.selected)
    expect(btn.className).not.toContain(s.state.unselected)

    rerender(<TabButton selected={false}>Today</TabButton>)
    expect(btn.getAttribute('aria-selected')).toBe('false')
    expect(btn.className).toContain(s.state.unselected)
    expect(btn.className).not.toContain(s.state.selected)
  })

  it('forwards onClick and arbitrary button attributes', async () => {
    const onClick = vi.fn()
    render(
      <TabButton selected={false} onClick={onClick} data-tour="tab-today">
        Today
      </TabButton>,
    )
    const btn = screen.getByRole('tab', { name: 'Today' })
    expect(btn).toHaveAttribute('data-tour', 'tab-today')
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(
      <TabButton selected={false} className="extra">Today</TabButton>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })
})
