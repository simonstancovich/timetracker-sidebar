import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from './Text'
import * as s from './Text.css'

describe('<Text />', () => {
  it('renders children in a <p> by default', () => {
    const { container } = render(<Text>hello</Text>)
    expect(container.querySelector('p')).toBeInTheDocument()
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('renders a <span> when inline is set', () => {
    const { container } = render(<Text inline>hello</Text>)
    expect(container.querySelector('span')).toBeInTheDocument()
    expect(container.querySelector('p')).toBeNull()
  })

  it('defaults to size=base, weight=normal, color=primary, align=left', () => {
    const { container } = render(<Text>x</Text>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.size.base)
    expect(el.className).toContain(s.weight.normal)
    expect(el.className).toContain(s.color.primary)
    expect(el.className).toContain(s.align.left)
  })

  it('respects size and weight props', () => {
    const { container } = render(<Text size="sm" weight="bold">x</Text>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.size.sm)
    expect(el.className).toContain(s.weight.bold)
  })

  it('applies truncate when enabled', () => {
    const { container } = render(<Text truncate>x</Text>)
    expect((container.firstChild as HTMLElement).className).toContain(s.truncate)
  })

  it('omits truncate by default', () => {
    const { container } = render(<Text>x</Text>)
    expect((container.firstChild as HTMLElement).className).not.toContain(s.truncate)
  })

  it('applies the color variant class', () => {
    const { container } = render(<Text color="tertiary">x</Text>)
    expect((container.firstChild as HTMLElement).className).toContain(s.color.tertiary)
  })

  it('applies text-align via the align prop', () => {
    const { container } = render(<Text align="center">x</Text>)
    expect((container.firstChild as HTMLElement).className).toContain(s.align.center)
  })

  it('applies the maxWidth variant class when passed a token', () => {
    const { container } = render(<Text maxWidth="prose">x</Text>)
    expect((container.firstChild as HTMLElement).className).toContain(s.maxWidth.prose)
  })

  it('omits the maxWidth class when prop is undefined', () => {
    const { container } = render(<Text>x</Text>)
    const el = container.firstChild as HTMLElement
    expect(el.className).not.toContain(s.maxWidth.prose)
    expect(el.className).not.toContain(s.maxWidth.narrow)
  })

  it('applies transform, tracking and italic classes', () => {
    const { container } = render(
      <Text transform="uppercase" tracking="looser" italic>x</Text>,
    )
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain(s.transform.uppercase)
    expect(cls).toContain(s.tracking.looser)
    expect(cls).toContain(s.italic)
  })

  it('exposes the 2xs size variant', () => {
    const { container } = render(<Text size="2xs">x</Text>)
    expect((container.firstChild as HTMLElement).className).toContain(s.size['2xs'])
  })

  it('never emits an inline style attribute (primitives stay class-based)', () => {
    const { container } = render(<Text maxWidth="md" color="pink" align="center">x</Text>)
    const el = container.firstChild as HTMLElement
    expect(el.getAttribute('style')).toBeNull()
  })
})
