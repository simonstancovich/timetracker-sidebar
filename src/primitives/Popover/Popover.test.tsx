import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
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
})
