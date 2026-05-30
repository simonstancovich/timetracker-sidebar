import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DisplayText } from './DisplayText'
import * as s from './DisplayText.css'

describe('<DisplayText />', () => {
  it('renders as a span with children', () => {
    render(<DisplayText>Tuesday, May 20</DisplayText>)
    expect(screen.getByText('Tuesday, May 20').tagName).toBe('SPAN')
  })

  it('applies defaults: size=2xl, weight=normal, color=primary, tracking=normal, leading=tight', () => {
    const { container } = render(<DisplayText>x</DisplayText>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.size['2xl'])
    expect(el.className).toContain(s.weight.normal)
    expect(el.className).toContain(s.color.primary)
    expect(el.className).toContain(s.tracking.normal)
    expect(el.className).toContain(s.leading.tight)
  })

  it('respects overridable props', () => {
    const { container } = render(
      <DisplayText
        size="display"
        weight="bold"
        color="accent"
        align="center"
        italic
        truncate
      >
        x
      </DisplayText>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.size.display)
    expect(el.className).toContain(s.weight.bold)
    expect(el.className).toContain(s.color.accent)
    expect(el.className).toContain(s.align.center)
    expect(el.className).toContain(s.italic)
    expect(el.className).toContain(s.truncate)
  })

  it('applies tabular when requested', () => {
    const { container } = render(<DisplayText tabular>x</DisplayText>)
    expect((container.firstChild as HTMLElement).className).toContain(s.tabular)
  })

  it('applies maxWidth, leading and tracking variants', () => {
    const { container } = render(
      <DisplayText maxWidth="prose" leading="snug" tracking="wide">
        x
      </DisplayText>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.maxWidth.prose)
    expect(el.className).toContain(s.leading.snug)
    expect(el.className).toContain(s.tracking.wide)
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(<DisplayText className="extra">x</DisplayText>)
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it.each(['span', 'p', 'div'] as const)('renders the tag specified by as=%s', (tag) => {
    const { container } = render(<DisplayText as={tag}>x</DisplayText>)
    expect((container.firstChild as HTMLElement).tagName).toBe(tag.toUpperCase())
  })

  it('forwards id and aria-* attributes', () => {
    const { container } = render(
      <DisplayText id="dt" aria-label="Total">
        12
      </DisplayText>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.id).toBe('dt')
    expect(el.getAttribute('aria-label')).toBe('Total')
  })

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLElement>()
    const { container } = render(<DisplayText ref={ref}>x</DisplayText>)
    expect(ref.current).toBe(container.firstChild)
  })
})
