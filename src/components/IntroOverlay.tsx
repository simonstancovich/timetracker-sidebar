import { useLayoutEffect, useState, type SyntheticEvent } from 'react'
import { useModal } from '../lib/useModal'
import { cx } from '../lib/cx'
import type { IntroStep } from '../lib/introSteps'
import { chapterRoman } from '../lib/roman'
import { type Mode } from '../theme'
import * as prim from '../primitives'
import { Spotlight } from './Spotlight'
import { TourTooltip } from './TourTooltip'
import { IntroDial } from './IntroDial'
import { fadeUp, delay } from '../styles/intro.css'
import { darkGlow } from '../styles/app.css'

export type { IntroStep }

function getEffectiveRect(el: HTMLElement): DOMRect {
  const base = el.getBoundingClientRect()
  let top = base.top, left = base.left, right = base.right, bottom = base.bottom
  el.querySelectorAll<HTMLElement>('*').forEach((child) => {
    const cs = window.getComputedStyle(child)
    if (cs.position !== 'absolute' && cs.position !== 'fixed') return
    if (cs.visibility === 'hidden' || cs.display === 'none') return
    const r = child.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) return
    top = Math.min(top, r.top)
    left = Math.min(left, r.left)
    right = Math.max(right, r.right)
    bottom = Math.max(bottom, r.bottom)
  })
  return new DOMRect(left, top, right - left, bottom - top)
}

export function IntroOverlay({
  mode,
  step,
  steps,
  onAdvance,
  onSkip,
  canAdvance,
}: {
  mode: Mode
  step: number
  steps: IntroStep[]
  onAdvance: () => void
  onSkip: () => void
  canAdvance: boolean
}) {
  const current = steps[step]
  const isLast = step === steps.length - 1
  const isFirst = step === 0
  const isFullScreen = !current.target
  const modalRef = useModal<HTMLDivElement>({ enabled: true, onClose: onSkip })

  // Content steps exclude the welcome (0) and done (last) full-screens.
  const contentTotal = steps.length - 2
  const contentIndex = step // step 1..contentTotal map to chapters I..N

  const [rect, setRect] = useState<DOMRect | null>(null)
  const [tipH, setTipH] = useState(0)
  useLayoutEffect(() => {
    if (modalRef.current) setTipH(modalRef.current.offsetHeight)
  }, [rect, step, current.title, current.body, current.hint, modalRef])
  useLayoutEffect(() => {
    if (!current.target) {
      setRect(null)
      return
    }
    const el = document.querySelector(`[data-tour="${current.target}"]`) as HTMLElement | null
    if (!el) {
      setRect(null)
      return
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const update = () => setRect(getEffectiveRect(el))
    update()
    // Track the target via observers instead of polling: ResizeObserver for
    // size changes, capture-phase scroll for movement in any ancestor, plus a
    // single settle after the smooth scroll animation finishes.
    const observer = new ResizeObserver(update)
    observer.observe(el)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    const settle = window.setTimeout(update, 450)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
      clearTimeout(settle)
    }
  }, [current.target, step])

  if (isFullScreen) {
    return (
      <prim.Overlay
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
        tabIndex={-1}
        zIndex="introHighlight"
        tone={mode === 'dark' ? 'none' : 'screen'}
        className={mode === 'dark' ? darkGlow : undefined}
      >
        <prim.Stack className={fadeUp} align="center" paddingBottom="xl">
          <IntroDial done={isLast} />
        </prim.Stack>

        <prim.Stack className={cx(fadeUp, delay["1"])} align="center" paddingBottom="sm">
          <prim.MonoText
            size="xs"
            weight="bold"
            tracking="display"
            transform="uppercase"
            color={isLast ? 'green' : 'accent'}
          >
            {isLast ? '✦ Ready' : 'Welcome'}
          </prim.MonoText>
        </prim.Stack>

        <prim.DisplayText
          className={cx(fadeUp, delay["2"])}
          size="5xl"
          align="center"
          tracking="tightest"
          maxWidth="prose"
        >
          {current.title}
        </prim.DisplayText>

        <prim.Stack
          className={cx(fadeUp, delay["3"])}
          align="center"
          paddingTop="md"
          paddingBottom="xl"
        >
          <prim.Text size="md" color="secondary" align="center" maxWidth="prose" preLine>
            {current.body}
          </prim.Text>
        </prim.Stack>

        <prim.Button
          onClick={onAdvance}
          variant={isLast ? 'success' : 'primary'}
          shape="pill"
          mono
          className={cx(fadeUp, delay["4"])}
        >
          {current.nextLabel || "Let's go"}
        </prim.Button>

        {isFirst && (
          <prim.Stack className={cx(fadeUp, delay["5"])} align="center" paddingTop="lg">
            <prim.Button variant="link" mono size="xs" onClick={onSkip}>
              Skip the tour
            </prim.Button>
          </prim.Stack>
        )}
      </prim.Overlay>
    )
  }

  if (!rect) {
    return (
      <prim.Overlay
        tone="scrim"
        zIndex="introMask"
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  const pad = 6
  const holeTop = Math.max(0, rect.top - pad)
  const holeLeft = Math.max(0, rect.left - pad)
  const holeRight = Math.min(window.innerWidth, rect.right + pad)
  const holeBottom = Math.min(window.innerHeight, rect.bottom + pad)
  const holeW = holeRight - holeLeft
  const holeH = holeBottom - holeTop

  const tooltipMaxW = 264
  const tipHeight = tipH || 150
  const spaceBelow = window.innerHeight - holeBottom
  const spaceAbove = holeTop
  const tooltipBelow = spaceBelow >= 150 || spaceBelow >= spaceAbove
  const preferredTop = tooltipBelow ? holeBottom + 12 : holeTop - 12 - tipHeight
  // Clamp into the viewport so tall targets (e.g. the achievements grid) can't
  // push the tooltip — and its Next button — off-screen.
  const tooltipTop = Math.max(10, Math.min(preferredTop, window.innerHeight - tipHeight - 10))
  const tooltipLeft = Math.max(10, Math.min(holeLeft, window.innerWidth - tooltipMaxW - 10))

  const swallow = (e: SyntheticEvent) => e.stopPropagation()

  return (
    <>
      <Spotlight
        hole={{
          top: holeTop,
          left: holeLeft,
          right: holeRight,
          bottom: holeBottom,
          width: holeW,
          height: holeH,
        }}
        readOnly={current.readOnly}
        onDismiss={swallow}
      />

      <TourTooltip
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
        tabIndex={-1}
        top={tooltipTop}
        left={tooltipLeft}
        maxWidth={tooltipMaxW}
      >
        <prim.Stack paddingBottom="xs">
          <prim.MonoText size="2xs" weight="bold" color="faint" transform="uppercase" tracking="loosest">
            <prim.MonoText size="2xs" weight="bold" color="accent" transform="uppercase" tracking="loosest">
              § {chapterRoman(contentIndex)}
            </prim.MonoText>
            {' · '}
            {contentTotal}
          </prim.MonoText>
        </prim.Stack>
        <prim.Stack paddingBottom="xs">
          <prim.DisplayText size="3xl" italic tracking="tight">
            {current.title}
          </prim.DisplayText>
        </prim.Stack>
        <prim.Stack paddingBottom={current.hint ? 'xs' : 'md'}>
          <prim.Text size="base" color="secondary">
            {current.body}
          </prim.Text>
        </prim.Stack>
        {current.hint && (
          <prim.Stack paddingBottom="md">
            <prim.DisplayText size="md" italic color="tertiary" leading="relaxed">
              {current.hint}
            </prim.DisplayText>
          </prim.Stack>
        )}
        <prim.Stack direction="row" align="center" justify="spaceBetween" gap="xs">
          <prim.Button variant="link" mono size="xs" onClick={onSkip}>
            Skip
          </prim.Button>
          {current.needsManualNext && (
            <prim.Button
              variant="primary"
              shape="pill"
              mono
              size="xs"
              onClick={onAdvance}
              disabled={!canAdvance}
            >
              {current.nextLabel || 'Next'}
            </prim.Button>
          )}
        </prim.Stack>
      </TourTooltip>
    </>
  )
}
