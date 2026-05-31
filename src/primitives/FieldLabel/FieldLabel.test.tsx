import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FieldLabel } from './FieldLabel'
import * as s from './FieldLabel.css'

describe('<FieldLabel />', () => {
  it('renders a <label> with children', () => {
    render(<FieldLabel>From</FieldLabel>)
    const el = screen.getByText('From')
    expect(el.tagName).toBe('LABEL')
    expect(el.className).toContain(s.root)
  })

  it('defaults tone to faint', () => {
    render(<FieldLabel>x</FieldLabel>)
    expect(screen.getByText('x').className).toContain(s.tone.faint)
  })

  it.each(['faint', 'accent'] as const)('applies tone=%s', (t) => {
    render(<FieldLabel tone={t}>x</FieldLabel>)
    expect(screen.getByText('x').className).toContain(s.tone[t])
  })

  it('forwards htmlFor to the underlying label', () => {
    render(<FieldLabel htmlFor="input-1">From</FieldLabel>)
    expect(screen.getByText('From').getAttribute('for')).toBe('input-1')
  })

  it('merges a consumer-supplied className', () => {
    render(<FieldLabel className="extra">x</FieldLabel>)
    expect(screen.getByText('x').className).toContain('extra')
  })

  it('forwards id and data-* attributes', () => {
    render(
      <FieldLabel id="lbl" data-testid="fl">
        x
      </FieldLabel>,
    )
    const el = screen.getByText('x')
    expect(el.id).toBe('lbl')
    expect(el.getAttribute('data-testid')).toBe('fl')
  })

  it('forwards ref to the underlying label', () => {
    const ref = createRef<HTMLLabelElement>()
    render(<FieldLabel ref={ref}>x</FieldLabel>)
    expect(ref.current).toBe(screen.getByText('x'))
  })
})
