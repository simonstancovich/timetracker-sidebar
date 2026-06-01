import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Marquee } from './Marquee'
import * as s from './Marquee.css'

describe('<Marquee />', () => {
  it('renders the wrapper + track and doubles the children', () => {
    const { container } = render(<Marquee>hello</Marquee>)
    const wrapper = container.firstChild as HTMLElement
    const track = wrapper.firstChild as HTMLElement
    expect(wrapper.className).toContain(s.root)
    expect(track.className).toContain(s.track)
    expect(track.textContent).toBe('hellohello')
  })

  it('applies the paused class when paused is true', () => {
    const { container } = render(<Marquee paused>hi</Marquee>)
    const track = (container.firstChild as HTMLElement).firstChild as HTMLElement
    expect(track.className).toContain(s.paused)
  })

  it('omits the paused class by default', () => {
    const { container } = render(<Marquee>hi</Marquee>)
    const track = (container.firstChild as HTMLElement).firstChild as HTMLElement
    expect(track.className).not.toContain(s.paused)
  })

  it('merges a consumer-supplied className on the wrapper', () => {
    const { container } = render(<Marquee className="extra">x</Marquee>)
    expect((container.firstChild as HTMLElement).className).toContain('extra')
  })

  it('forwards trackClassName to the track', () => {
    const { container } = render(<Marquee trackClassName="track-extra">x</Marquee>)
    const track = (container.firstChild as HTMLElement).firstChild as HTMLElement
    expect(track.className).toContain('track-extra')
  })

  it('forwards ref to the wrapper', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<Marquee ref={ref}>x</Marquee>)
    expect(ref.current).toBe(container.firstChild)
  })
})
