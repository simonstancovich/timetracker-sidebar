import { createRef } from 'react'
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

  it('decouples visual size from semantic level when size is provided', () => {
    render(
      <Heading level={3} size={1}>
        X
      </Heading>,
    )
    const el = screen.getByRole('heading', { level: 3 })
    expect(el.className).toContain(s.level[1])
    expect(el.className).not.toContain(s.level[3])
  })

  it.each(['primary', 'secondary', 'accent', 'onAccent'] as const)(
    'applies %s color variant',
    (c) => {
      render(
        <Heading level={1} color={c}>
          X
        </Heading>,
      )
      expect(screen.getByRole('heading', { level: 1 }).className).toContain(s.color[c])
    },
  )

  it('merges a consumer-supplied className', () => {
    render(<Heading className="extra">X</Heading>)
    expect(screen.getByRole('heading').className).toContain('extra')
  })

  it('forwards id and aria-* attributes', () => {
    render(
      <Heading id="hdr" aria-describedby="hint">
        X
      </Heading>,
    )
    const el = screen.getByRole('heading')
    expect(el.id).toBe('hdr')
    expect(el.getAttribute('aria-describedby')).toBe('hint')
  })

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLHeadingElement>()
    render(<Heading ref={ref}>X</Heading>)
    expect(ref.current).toBe(screen.getByRole('heading'))
  })
})
