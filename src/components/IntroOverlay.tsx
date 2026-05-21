import { useEffect, useLayoutEffect, useState, type SyntheticEvent } from 'react'
import { useModal } from '../lib/useModal'
import type { IntroStep } from '../lib/introSteps'
import { chapterRoman } from '../lib/roman'
import { vars, type Mode } from '../theme'
import { Button, DisplayText, MonoText, Overlay, Stack, Text } from '../primitives'
import { Spotlight } from './Spotlight'
import { TourTooltip } from './TourTooltip'

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

// Animated watch-dial mark — sweeping ring + ticking hand, tick marks.
function IntroDial({ done }: { done: boolean }) {
  const ringColor = done ? vars.typography.green : vars.typography.accent
  return (
    <svg width={108} height={108} viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="29" fill="none" stroke={vars.border.soft} strokeWidth={2.5} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        <line
          key={a}
          x1="32"
          y1="3.5"
          x2="32"
          y2={i % 2 === 0 ? 7 : 5.5}
          stroke={i % 2 === 0 ? vars.typography.tertiary : vars.typography.faint}
          strokeWidth={i % 2 === 0 ? 1.4 : 1}
          strokeLinecap="round"
          transform={`rotate(${a} 32 32)`}
          opacity={0.7}
        />
      ))}
      <circle
        className="intro-dial-sweep"
        cx="32"
        cy="32"
        r="29"
        fill="none"
        stroke={ringColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={2 * Math.PI * 29}
        strokeDashoffset={2 * Math.PI * 29}
        transform="rotate(-90 32 32)"
      />
      {done ? (
        <polyline
          points="22 33 29 40 43 25"
          fill="none"
          stroke={vars.typography.green}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <g className="intro-dial-hand">
          <line x1="32" y1="32" x2="32" y2="14" stroke={vars.typography.accent} strokeWidth={2.5} strokeLinecap="round" />
          <circle cx="32" cy="32" r="3" fill={vars.typography.accent} />
        </g>
      )}
    </svg>
  )
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
      <Overlay
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
        tabIndex={-1}
        zIndex="introHighlight"
        tone={mode === 'dark' ? 'none' : 'screen'}
        className={mode === 'dark' ? 'app-dark-glow' : undefined}
      >
        <Stack className="intro-in" align="center" paddingBottom="xl">
          <IntroDial done={isLast} />
        </Stack>

        <Stack className="intro-in intro-d1" align="center" paddingBottom="sm">
          <MonoText
            size="xs"
            weight="bold"
            tracking="display"
            transform="uppercase"
            color={isLast ? 'green' : 'accent'}
          >
            {isLast ? '✦ Ready' : 'Welcome'}
          </MonoText>
        </Stack>

        <DisplayText
          className="intro-in intro-d2"
          size="5xl"
          align="center"
          tracking="tightest"
          maxWidth="prose"
        >
          {current.title}
        </DisplayText>

        <Stack
          className="intro-in intro-d3"
          align="center"
          paddingTop="md"
          paddingBottom="xl"
        >
          <Text size="md" color="secondary" align="center" maxWidth="prose" preLine>
            {current.body}
          </Text>
        </Stack>

        <Button
          onClick={onAdvance}
          variant={isLast ? 'success' : 'primary'}
          shape="pill"
          mono
          className="intro-in intro-d4"
        >
          {current.nextLabel || "Let's go"}
        </Button>

        {isFirst && (
          <Stack className="intro-in intro-d5" align="center" paddingTop="lg">
            <Button variant="link" mono size="xs" onClick={onSkip}>
              Skip the tour
            </Button>
          </Stack>
        )}
      </Overlay>
    )
  }

  if (!rect) {
    return (
      <Overlay
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
        <Stack paddingBottom="xs">
          <MonoText size="2xs" weight="bold" color="faint" transform="uppercase" tracking="loosest">
            <MonoText size="2xs" weight="bold" color="accent" transform="uppercase" tracking="loosest">
              § {chapterRoman(contentIndex)}
            </MonoText>
            {' · '}
            {contentTotal}
          </MonoText>
        </Stack>
        <Stack paddingBottom="xs">
          <DisplayText size="3xl" italic tracking="tight">
            {current.title}
          </DisplayText>
        </Stack>
        <Stack paddingBottom={current.hint ? 'xs' : 'md'}>
          <Text size="base" color="secondary">
            {current.body}
          </Text>
        </Stack>
        {current.hint && (
          <Stack paddingBottom="md">
            <DisplayText size="md" italic color="tertiary" leading="relaxed">
              {current.hint}
            </DisplayText>
          </Stack>
        )}
        <Stack direction="row" align="center" justify="spaceBetween" gap="xs">
          <Button variant="link" mono size="xs" onClick={onSkip}>
            Skip
          </Button>
          {current.needsManualNext && (
            <Button
              variant="primary"
              shape="pill"
              mono
              size="xs"
              onClick={onAdvance}
              disabled={!canAdvance}
            >
              {current.nextLabel || 'Next'}
            </Button>
          )}
        </Stack>
      </TourTooltip>
    </>
  )
}
