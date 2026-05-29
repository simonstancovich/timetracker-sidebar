import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Popover } from './Popover'
import * as s from './Popover.css'

describe('<Popover />', () => {
  it('renders children inside the popover surface', () => {
    const { getByText, container } = render(
      <Popover><span>menu item</span></Popover>,
    )
    expect(getByText('menu item')).toBeInTheDocument()
    expect((container.firstChild as HTMLElement).className).toContain(s.root)
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(
      <Popover className="custom"><span /></Popover>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('custom')
  })

  it('forwards a role attribute set by the consumer', () => {
    render(<Popover role="listbox"><span>opt</span></Popover>)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('forwards id and aria-* attributes', () => {
    const { container } = render(
      <Popover id="menu-1" aria-label="Options"><span /></Popover>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.id).toBe('menu-1')
    expect(el.getAttribute('aria-label')).toBe('Options')
  })

  it('forwards ref to the underlying div', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<Popover ref={ref}><span /></Popover>)
    expect(ref.current).toBe(container.firstChild)
  })
})
