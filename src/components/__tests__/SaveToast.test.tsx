import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SaveToast } from '../SaveToast'
import * as stackS from '../../primitives/Stack/Stack.css'
import * as toastS from '../SaveToast.css'

describe('<SaveToast />', () => {
  it('returns null when toast is null', () => {
    const { container } = render(<SaveToast toast={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('puts the backdrop class plus center align + center justify on the outer wrapper', () => {
    const { container } = render(
      <SaveToast toast={{ cheer: 'Logged!', hours: '1h', xp: 10 }} />,
    )
    const outer = container.firstChild as HTMLElement
    expect(outer.className).toContain(toastS.backdrop)
    expect(outer.className).toContain(stackS.align.center)
    expect(outer.className).toContain(stackS.justify.center)
  })

  it('renders the cheer + hour + xp text', () => {
    const { getByText } = render(
      <SaveToast toast={{ cheer: 'Logged!', hours: '1h', xp: 10 }} />,
    )
    expect(getByText('Logged!')).toBeInTheDocument()
    expect(getByText(/1h/)).toBeInTheDocument()
    expect(getByText(/10 XP/)).toBeInTheDocument()
  })
})
