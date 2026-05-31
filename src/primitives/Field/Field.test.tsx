import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Field } from './Field'
import * as label from '../FieldLabel/FieldLabel.css'

describe('<Field />', () => {
  it('renders the label above its children', () => {
    render(
      <Field label="From">
        <input data-testid="control" />
      </Field>,
    )
    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByTestId('control')).toBeInTheDocument()
  })

  it('passes the tone through to the FieldLabel', () => {
    render(
      <Field label="From" tone="accent">
        x
      </Field>,
    )
    expect(screen.getByText('From').className).toContain(label.tone.accent)
  })

  it('forwards id, aria-* and data-* attributes to the wrapper', () => {
    const { container } = render(
      <Field label="L" id="f" aria-describedby="hint" data-testid="field">
        x
      </Field>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.id).toBe('f')
    expect(el.getAttribute('aria-describedby')).toBe('hint')
    expect(el.getAttribute('data-testid')).toBe('field')
  })

  it('forwards ref to the wrapper element', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <Field label="L" ref={ref}>
        x
      </Field>,
    )
    expect(ref.current).toBe(container.firstChild)
  })
})
