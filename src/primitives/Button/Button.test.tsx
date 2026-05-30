import { createRef } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'
import * as s from './Button.css'

describe('<Button />', () => {
  it('renders a real <button> with type="button" by default', () => {
    render(<Button>Go</Button>)
    const el = screen.getByRole('button', { name: 'Go' })
    expect(el.tagName).toBe('BUTTON')
    expect(el).toHaveAttribute('type', 'button')
  })

  it('applies default variant + size classes', () => {
    render(<Button>Go</Button>)
    const el = screen.getByRole('button', { name: 'Go' })
    expect(el.className).toContain(s.variant.primary)
    expect(el.className).toContain(s.size.md)
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('passes through HTML attributes (disabled, aria-label)', () => {
    render(<Button disabled aria-label="explicit">X</Button>)
    const el = screen.getByRole('button', { name: 'explicit' })
    expect(el).toBeDisabled()
  })

  it('supports type="submit" for forms', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute('type', 'submit')
  })

  it('applies secondary variant and xs size', () => {
    render(<Button variant="secondary" size="xs">Go</Button>)
    const el = screen.getByRole('button', { name: 'Go' })
    expect(el.className).toContain(s.variant.secondary)
    expect(el.className).toContain(s.size.xs)
  })

  it('applies link variant', () => {
    render(<Button variant="link" size="xs">disconnect</Button>)
    expect(screen.getByRole('button', { name: 'disconnect' }).className).toContain(s.variant.link)
  })

  it('applies grow class when prop is true', () => {
    render(<Button grow>Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' }).className).toContain(s.grow)
  })

  it('applies the success variant, pill shape, and mono treatment', () => {
    render(<Button variant="success" shape="pill" mono>Go</Button>)
    const el = screen.getByRole('button', { name: 'Go' })
    expect(el.className).toContain(s.variant.success)
    expect(el.className).toContain(s.shape.pill)
    expect(el.className).toContain(s.mono)
  })

  it('omits mono and grow classes when their props are false', () => {
    render(<Button>Go</Button>)
    const el = screen.getByRole('button', { name: 'Go' })
    expect(el.className).not.toContain(s.mono)
    expect(el.className).not.toContain(s.grow)
  })

  it('merges a consumer-supplied className', () => {
    render(<Button className="extra">Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' }).className).toContain('extra')
  })

  it('blocks onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('forwards ref to the underlying button', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Go</Button>)
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Go' }))
  })
})
