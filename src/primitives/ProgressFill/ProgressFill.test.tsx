import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ProgressFill } from './ProgressFill'
import * as s from './ProgressFill.css'

describe('<ProgressFill />', () => {
  it('renders with accent tone and the root class by default', () => {
    const { container } = render(<ProgressFill progress={0.5} />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain(s.root)
    expect(el.className).toContain(s.tone.accent)
  })

  it('sets width from the progress prop', () => {
    const { container } = render(<ProgressFill progress={0.44} />)
    expect((container.firstChild as HTMLElement).style.width).toBe('44%')
  })

  it.each([
    [-0.5, '0%'],
    [0, '0%'],
    [0.5, '50%'],
    [1, '100%'],
    [1.5, '100%'],
  ])('clamps progress=%s to %s', (input, expected) => {
    const { container } = render(<ProgressFill progress={input} />)
    expect((container.firstChild as HTMLElement).style.width).toBe(expected)
  })

  it('applies the done tone when requested', () => {
    const { container } = render(<ProgressFill progress={1} tone="done" />)
    expect((container.firstChild as HTMLElement).className).toContain(s.tone.done)
  })

  it('is aria-hidden (decorative)', () => {
    const { container } = render(<ProgressFill progress={0.5} />)
    expect((container.firstChild as HTMLElement).getAttribute('aria-hidden')).toBe('true')
  })

  it('merges a consumer-supplied className', () => {
    const { container } = render(<ProgressFill progress={0.5} className="extra" />)
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<ProgressFill progress={0.5} ref={ref} />)
    expect(ref.current).toBe(container.firstChild)
  })
})
