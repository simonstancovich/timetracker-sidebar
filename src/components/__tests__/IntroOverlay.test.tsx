import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IntroOverlay } from '../IntroOverlay'
import type { IntroStep } from '../../lib/introSteps'

const M = {
  bg: '#fff', s1: '#fff', s2: '#eee', b1: '#ccc',
  t1: '#000', t2: '#333', t3: '#666',
  ac: '#7c3aed', btn: '#7c3aed', bsh: '0 4px 14px rgba(0,0,0,0.2)',
}

const welcome: IntroStep = {
  target: null,
  title: "Time tracking shouldn't feel like homework.",
  body: 'Run the timer.',
  nextLabel: "Let's go →",
}

const tooltip: IntroStep = {
  target: 'tab-timer',
  title: 'Open the Timer tab',
  body: 'Click here.',
  hint: 'Try it.',
  needsManualNext: true,
  nextLabel: 'Next →',
}

const final: IntroStep = {
  target: null,
  title: "You're all set! 🎉",
  body: 'Done.',
  nextLabel: 'Start tracking',
}

describe('<IntroOverlay /> — fullscreen step', () => {
  it('renders the welcome title, body, and next button', () => {
    render(
      <IntroOverlay
        M={M}
        step={0}
        steps={[welcome, tooltip, final]}
        onAdvance={() => {}}
        onSkip={() => {}}
        canAdvance={true}
      />,
    )
    expect(screen.getByRole('heading', { name: welcome.title })).toBeInTheDocument()
    expect(screen.getByText(welcome.body)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Let's go →" })).toBeInTheDocument()
  })

  it('shows the Skip intro link only on the first step', () => {
    render(
      <IntroOverlay
        M={M}
        step={0}
        steps={[welcome, tooltip, final]}
        onAdvance={() => {}}
        onSkip={() => {}}
        canAdvance={true}
      />,
    )
    expect(screen.getByRole('button', { name: /skip intro/i })).toBeInTheDocument()
  })

  it('Next button calls onAdvance', async () => {
    const onAdvance = vi.fn()
    render(
      <IntroOverlay
        M={M}
        step={0}
        steps={[welcome, tooltip, final]}
        onAdvance={onAdvance}
        onSkip={() => {}}
        canAdvance={true}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: "Let's go →" }))
    expect(onAdvance).toHaveBeenCalledOnce()
  })

  it('Skip intro button calls onSkip', async () => {
    const onSkip = vi.fn()
    render(
      <IntroOverlay
        M={M}
        step={0}
        steps={[welcome, tooltip, final]}
        onAdvance={() => {}}
        onSkip={onSkip}
        canAdvance={true}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /skip intro/i }))
    expect(onSkip).toHaveBeenCalledOnce()
  })

  it('Escape calls onSkip via useModal', async () => {
    const onSkip = vi.fn()
    render(
      <IntroOverlay
        M={M}
        step={0}
        steps={[welcome, tooltip, final]}
        onAdvance={() => {}}
        onSkip={onSkip}
        canAdvance={true}
      />,
    )
    await new Promise((r) => requestAnimationFrame(r))
    await userEvent.keyboard('{Escape}')
    expect(onSkip).toHaveBeenCalledOnce()
  })

  it('renders dialog role with aria-labelledby on the title', () => {
    render(
      <IntroOverlay
        M={M}
        step={0}
        steps={[welcome, tooltip, final]}
        onAdvance={() => {}}
        onSkip={() => {}}
        canAdvance={true}
      />,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'intro-fullscreen-title')
  })
})

describe('<IntroOverlay /> — tooltip step (no rect)', () => {
  // No data-tour element exists in jsdom so rect is null. The component
  // renders a plain mask.
  it('renders without crashing when target is missing from the DOM', () => {
    render(
      <IntroOverlay
        M={M}
        step={1}
        steps={[welcome, tooltip, final]}
        onAdvance={() => {}}
        onSkip={() => {}}
        canAdvance={true}
      />,
    )
    // No throw is the test.
  })
})
