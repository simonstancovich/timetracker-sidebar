import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { TextInput } from './TextInput'
import * as s from './TextInput.css'

describe('<TextInput />', () => {
  it('renders an input element', () => {
    const { container } = render(<TextInput />)
    expect(container.firstChild).toBeInstanceOf(HTMLInputElement)
  })

  it('defaults type to text', () => {
    const { container } = render(<TextInput />)
    expect((container.firstChild as HTMLInputElement).getAttribute('type')).toBe('text')
  })

  it('forwards ref to the underlying input', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(<TextInput ref={ref} />)
    expect(ref.current).toBe(container.firstChild)
  })

  it('toggles filled, trailingSpace and fullWidth classes', () => {
    const { container, rerender } = render(<TextInput />)
    let cls = (container.firstChild as HTMLElement).className
    expect(cls).not.toContain(s.filled)
    expect(cls).not.toContain(s.trailingSpace)
    expect(cls).not.toContain(s.fullWidth)

    rerender(<TextInput filled trailingSpace fullWidth />)
    cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain(s.filled)
    expect(cls).toContain(s.trailingSpace)
    expect(cls).toContain(s.fullWidth)
  })

  it('forwards standard input props', () => {
    const { getByPlaceholderText } = render(
      <TextInput placeholder="Search" value="hi" readOnly />,
    )
    expect(getByPlaceholderText('Search')).toHaveValue('hi')
  })

  it('passes through className', () => {
    const { container } = render(<TextInput className="custom" />)
    expect((container.firstChild as HTMLElement).className).toContain('custom')
  })
})
