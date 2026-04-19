import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Heading } from './Heading'
import * as s from './Heading.css'

describe('<Heading />', () => {
  it('renders <h1> by default with level=1 class', () => {
    render(<Heading>Title</Heading>)
    const el = screen.getByRole('heading', { level: 1 })
    expect(el).toHaveTextContent('Title')
    expect(el.className).toContain(s.level[1])
  })

  it('renders the element for the specified level', () => {
    render(<Heading level={3}>Sub</Heading>)
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('applies the size class matching the level', () => {
    render(<Heading level={2}>X</Heading>)
    const el = screen.getByRole('heading', { level: 2 })
    expect(el.className).toContain(s.level[2])
  })

  it('applies a color variant', () => {
    render(<Heading level={1} color="accent">X</Heading>)
    const el = screen.getByRole('heading', { level: 1 })
    expect(el.className).toContain(s.color.accent)
  })
})
