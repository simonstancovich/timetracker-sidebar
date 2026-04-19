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
})
