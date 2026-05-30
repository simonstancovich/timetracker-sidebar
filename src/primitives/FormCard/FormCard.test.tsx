import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FormCard } from './FormCard'
import * as s from './FormCard.css'
import * as card from '../Card/Card.css'

describe('<FormCard />', () => {
  it('renders a Card with default tone and the field-stack class', () => {
    const { container } = render(<FormCard>x</FormCard>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(card.root)
    expect(el.className).toContain(card.tone.default)
    expect(el.className).toContain(card.pad.md)
    expect(el.className).toContain(s.stack)
  })

  it('raises the Card to accent tone when accent is true', () => {
    const { container } = render(<FormCard accent>x</FormCard>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(card.tone.accent)
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(<FormCard className="extra">x</FormCard>)
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('forwards id, aria-* and data-* attributes', () => {
    const { container } = render(
      <FormCard id="f" aria-label="New entry" data-testid="form">
        x
      </FormCard>,
    )
    const el = container.firstChild as HTMLElement
    expect(el.id).toBe('f')
    expect(el.getAttribute('aria-label')).toBe('New entry')
    expect(el.getAttribute('data-testid')).toBe('form')
  })

  it('forwards ref through to the underlying Card element', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<FormCard ref={ref}>x</FormCard>)
    expect(ref.current).toBe(container.firstChild)
  })
})
