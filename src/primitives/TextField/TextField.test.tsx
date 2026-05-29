import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { TextField } from './TextField'
import * as s from './TextField.css'

describe('<TextField />', () => {
  it('renders an input element', () => {
    const { container } = render(<TextField />)
    expect(container.firstChild).toBeInstanceOf(HTMLInputElement)
  })

  it('forwards ref to the underlying input', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(<TextField ref={ref} />)
    expect(ref.current).toBe(container.firstChild)
  })

  it('toggles serif and filled classes', () => {
    const { container, rerender } = render(<TextField />)
    let cls = (container.firstChild as HTMLElement).className
    expect(cls).not.toContain(s.serif)
    expect(cls).not.toContain(s.filled)

    rerender(<TextField serif filled />)
    cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain(s.serif)
    expect(cls).toContain(s.filled)
  })

  it('toggles invalid class and sets aria-invalid', () => {
    const { container, rerender } = render(<TextField />)
    let el = container.firstChild as HTMLInputElement
    expect(el.className).not.toContain(s.invalid)
    expect(el.getAttribute('aria-invalid')).toBeNull()

    rerender(<TextField invalid />)
    el = container.firstChild as HTMLInputElement
    expect(el.className).toContain(s.invalid)
    expect(el.getAttribute('aria-invalid')).toBe('true')
  })

  it('forwards standard input props', () => {
    const { getByPlaceholderText } = render(
      <TextField placeholder="Search" value="hi" readOnly />,
    )
    expect(getByPlaceholderText('Search')).toHaveValue('hi')
  })

  it('passes through className', () => {
    const { container } = render(<TextField className="custom" />)
    expect((container.firstChild as HTMLElement).className).toContain('custom')
  })
})
