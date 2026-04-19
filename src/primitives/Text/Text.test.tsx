import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from './Text'
import * as s from './Text.css'

describe('<Text />', () => {
  it('renders children in a <p>', () => {
    const { container } = render(<Text>hello</Text>)
    expect(container.querySelector('p')).toBeInTheDocument()
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('defaults to primary color + left align', () => {
    const { container } = render(<Text>x</Text>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.color.primary)
    expect(el.className).toContain(s.align.left)
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

  it('never emits an inline style attribute (primitives stay class-based)', () => {
    const { container } = render(<Text maxWidth="md" color="pink" align="center">x</Text>)
    const el = container.firstChild as HTMLElement
    expect(el.getAttribute('style')).toBeNull()
  })
})
