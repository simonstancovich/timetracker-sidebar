import { describe, it, expect, vi } from 'vitest'
import { useEffect, useState } from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useModal } from './useModal'

function Modal({ enabled, onClose }: { enabled: boolean; onClose: () => void }) {
  const ref = useModal<HTMLDivElement>({ enabled, onClose })
  if (!enabled) return null
  return (
    <div ref={ref} data-testid="modal" tabIndex={-1}>
      <button data-testid="first">First</button>
      <button data-testid="middle">Middle</button>
      <button data-testid="last">Last</button>
    </div>
  )
}

const flushRaf = () => new Promise((r) => requestAnimationFrame(r))

describe('useModal', () => {
  it('focuses the first focusable inside the container on mount', async () => {
    render(<Modal enabled onClose={() => {}} />)
    await flushRaf()
    expect(screen.getByTestId('first')).toHaveFocus()
  })

  it('Escape calls onClose', async () => {
    const onClose = vi.fn()
    render(<Modal enabled onClose={onClose} />)
    await flushRaf()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('Tab from the last focusable wraps to the first', async () => {
    render(<Modal enabled onClose={() => {}} />)
    await flushRaf()
    screen.getByTestId('last').focus()
    await userEvent.tab()
    expect(screen.getByTestId('first')).toHaveFocus()
  })

  it('Shift+Tab from the first focusable wraps to the last', async () => {
    render(<Modal enabled onClose={() => {}} />)
    await flushRaf()
    screen.getByTestId('first').focus()
    await userEvent.tab({ shift: true })
    expect(screen.getByTestId('last')).toHaveFocus()
  })

  it('restores focus to the element that was focused before the modal opened', async () => {
    function Stateful() {
      const [open, setOpen] = useState(false)
      // Focus the opener once on mount so Escape can return to it.
      useEffect(() => {
        const o = document.querySelector('[data-testid="opener"]') as HTMLButtonElement | null
        o?.focus()
      }, [])
      return (
        <>
          <button data-testid="opener" onClick={() => setOpen(true)}>Open</button>
          <Modal enabled={open} onClose={() => setOpen(false)} />
        </>
      )
    }
    render(<Stateful />)
    expect(screen.getByTestId('opener')).toHaveFocus()
    await userEvent.click(screen.getByTestId('opener'))
    await flushRaf()
    expect(screen.getByTestId('first')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await flushRaf()
    expect(screen.getByTestId('opener')).toHaveFocus()
  })

  it('does nothing when enabled=false', async () => {
    const onClose = vi.fn()
    render(<Modal enabled={false} onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('parent re-renders with a fresh onClose closure do not yank focus out of the modal', async () => {
    let bump: () => void = () => {}
    function Stateful() {
      const [tick, setTick] = useState(0)
      bump = () => setTick((n) => n + 1)
      // Fresh `() => …` closure on every render — the kind of thing parents
      // commonly pass. The modal must NOT tear down + re-focus on each render.
      return <Modal enabled={true} onClose={() => { void tick }} />
    }
    render(<Stateful />)
    await flushRaf()
    expect(screen.getByTestId('first')).toHaveFocus()

    // Move focus to the middle button, then force the parent to re-render.
    screen.getByTestId('middle').focus()
    expect(screen.getByTestId('middle')).toHaveFocus()
    act(() => bump())
    act(() => bump())
    act(() => bump())
    await flushRaf()

    // Focus must not have been snapped back to `first` by a spurious
    // effect re-run. Before the onClose-in-ref fix this assertion failed.
    expect(screen.getByTestId('middle')).toHaveFocus()
  })
})
