import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyMessage } from './EmptyMessage'
import * as s from './EmptyMessage.css'

describe('<EmptyMessage />', () => {
  it('renders a div with the root class and children', () => {
    const { container } = render(<EmptyMessage>No clients yet.</EmptyMessage>)
    const el = container.firstChild as HTMLElement
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain(s.root)
    expect(screen.getByText('No clients yet.')).toBe(el)
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(<EmptyMessage className="extra">x</EmptyMessage>)
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('forwards id, aria-* and data-* attributes', () => {
    const { container } = render(
      <EmptyMessage id="em" aria-live="polite" data-testid="empty">
        x
      </EmptyMessage>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.id).toBe('em')
    expect(el.getAttribute('aria-live')).toBe('polite')
    expect(el.getAttribute('data-testid')).toBe('empty')
  })

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<EmptyMessage ref={ref}>x</EmptyMessage>)
    expect(ref.current).toBe(container.firstChild)
  })
})
