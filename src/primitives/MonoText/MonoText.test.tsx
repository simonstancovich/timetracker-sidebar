import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MonoText } from './MonoText'
import * as s from './MonoText.css'

describe('<MonoText />', () => {
  it('renders as a span with children', () => {
    render(<MonoText>05:58:53</MonoText>)
    const el = screen.getByText('05:58:53')
    expect(el.tagName).toBe('SPAN')
  })

  it('applies defaults: size=base, weight=bold, color=primary, tracking=normal', () => {
    const { container } = render(<MonoText>x</MonoText>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.size.base)
    expect(el.className).toContain(s.weight.bold)
    expect(el.className).toContain(s.color.primary)
    expect(el.className).toContain(s.tracking.normal)
  })

  it('respects all overridable props', () => {
    const { container } = render(
      <MonoText size="xs" weight="medium" color="tertiary" tracking="wide">
        x
      </MonoText>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.size.xs)
    expect(el.className).toContain(s.weight.medium)
    expect(el.className).toContain(s.color.tertiary)
    expect(el.className).toContain(s.tracking.wide)
  })

  it('accepts a pink or accent color (token-driven)', () => {
    const { container } = render(<MonoText color="pink">x</MonoText>)
    expect((container.firstChild as HTMLElement).className).toContain(s.color.pink)
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(<MonoText className="extra">x</MonoText>)
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('applies an uppercase transform and wide tracking when requested', () => {
    const { container } = render(
      <MonoText transform="uppercase" tracking="loosest">
        x
      </MonoText>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.transform.uppercase)
    expect(el.className).toContain(s.tracking.loosest)
  })

  it('applies tabular and align variants when requested', () => {
    const { container } = render(
      <MonoText tabular align="right">x</MonoText>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.tabular)
    expect(el.className).toContain(s.align.right)
  })

  it('renders the tag specified by the as prop', () => {
    const { container } = render(
      <MonoText as="time" dateTime="2026-05-29T13:00">13:00</MonoText>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.tagName).toBe('TIME')
    expect(el.getAttribute('datetime')).toBe('2026-05-29T13:00')
  })

  it('forwards id and aria-* attributes', () => {
    const { container } = render(
      <MonoText id="clock" aria-label="Current time">13:00</MonoText>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.id).toBe('clock')
    expect(el.getAttribute('aria-label')).toBe('Current time')
  })

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLElement>()
    const { container } = render(<MonoText ref={ref}>x</MonoText>)
    expect(ref.current).toBe(container.firstChild)
  })
})
