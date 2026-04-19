import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IconTile } from './IconTile'
import * as s from './IconTile.css'

describe('<IconTile />', () => {
  it('renders children', () => {
    render(<IconTile>⏱</IconTile>)
    expect(screen.getByText('⏱')).toBeInTheDocument()
  })

  it('applies default size=md', () => {
    const { container } = render(<IconTile>⏱</IconTile>)
    expect((container.firstChild as HTMLElement).className).toContain(s.size.md)
  })

  it('respects size prop', () => {
    const { container } = render(<IconTile size="xl">⏱</IconTile>)
    expect((container.firstChild as HTMLElement).className).toContain(s.size.xl)
  })
})
