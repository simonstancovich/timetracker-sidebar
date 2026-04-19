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

  it('applies maxWidth inline when passed', () => {
    const { container } = render(<Text maxWidth={280}>x</Text>)
    expect((container.firstChild as HTMLElement).style.maxWidth).toBe('280px')
  })
})
