import { useEffect, useLayoutEffect, useState } from 'react'
import { useModal } from '../lib/useModal'
import type { IntroStep } from '../lib/introSteps'

export type { IntroStep }

type Theme = {
  bg: string
  s1: string
  s2: string
  b1: string
  t1: string
  t2: string
  t3: string
  ac: string
  btn: string
  bsh: string
}

const WIGGLE_EMOJIS = ['⏱️', '⏰', '🕰️', '⌛']

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
  M,
  step,
  steps,
  onAdvance,
  onSkip,
  canAdvance,
}: {
  M: Theme
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

  const [emojiIdx, setEmojiIdx] = useState(0)
  useEffect(() => {
    if (!isFullScreen) return
    const id = window.setInterval(() => setEmojiIdx((i) => (i + 1) % WIGGLE_EMOJIS.length), 1600)
    return () => clearInterval(id)
  }, [isFullScreen])

  const [rect, setRect] = useState<DOMRect | null>(null)
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
    const t1 = window.setTimeout(update, 250)
    const t2 = window.setTimeout(update, 550)
    const poll = window.setInterval(update, 200)
    const onResize = () => update()
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearInterval(poll)
      window.removeEventListener('resize', onResize)
    }
  }, [current.target, step])

  if (isFullScreen) {
    return (
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-fullscreen-title"
        tabIndex={-1}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 500,
          background: `linear-gradient(180deg, ${M.bg} 0%, ${M.s2} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px 22px',
          textAlign: 'center',
          gap: 14,
          overflow: 'auto',
        }}
      >
        <div style={{ fontSize: 72, lineHeight: 1 }}>
          <span className="intro-emoji" key={emojiIdx}>
            {isLast ? '🎉' : WIGGLE_EMOJIS[emojiIdx]}
          </span>
        </div>

        <h1 id="intro-fullscreen-title" className="intro-in" style={{ margin: 0, fontSize: 22, color: M.t1, fontWeight: 800, lineHeight: 1.25, maxWidth: 320 }}>
          {current.title}
        </h1>

        <p className="intro-in" style={{ margin: '4px 0 12px', fontSize: 13, color: M.t2, maxWidth: 320, lineHeight: 1.5, whiteSpace: 'pre-line', animationDelay: '120ms' }}>
          {current.body}
        </p>

        <button
          onClick={onAdvance}
          className="intro-in"
          style={{
            padding: '12px 22px',
            borderRadius: 12,
            background: M.btn,
            color: '#fff',
            border: 'none',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: M.bsh,
            animationDelay: '240ms',
          }}
        >
          {current.nextLabel || "Let's go →"}
        </button>

        {isFirst && (
          <button
            onClick={onSkip}
            className="intro-in"
            style={{
              background: 'none',
              border: 'none',
              color: M.t3,
              fontSize: 11,
              cursor: 'pointer',
              textDecoration: 'underline',
              animationDelay: '320ms',
            }}
          >
            Skip intro
          </button>
        )}
      </div>
    )
  }

  if (!rect) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 499,
          background: 'rgba(0,0,0,0.6)',
          pointerEvents: 'auto',
        }}
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

  const tooltipMaxW = 260
  const spaceBelow = window.innerHeight - holeBottom
  const spaceAbove = holeTop
  const tooltipBelow = spaceBelow >= 140 || spaceBelow >= spaceAbove
  const tooltipTop = tooltipBelow ? holeBottom + 10 : Math.max(10, holeTop - 10 - 140)
  const tooltipLeft = Math.max(10, Math.min(holeLeft, window.innerWidth - tooltipMaxW - 10))

  const maskBase: React.CSSProperties = {
    position: 'fixed',
    background: 'rgba(0,0,0,0.62)',
    zIndex: 499,
    pointerEvents: 'auto',
  }
  const swallow = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <>
      <div style={{ ...maskBase, top: 0, left: 0, right: 0, height: holeTop }} onClick={swallow} onMouseDown={swallow} />
      <div style={{ ...maskBase, top: holeTop, left: 0, width: holeLeft, height: holeH }} onClick={swallow} onMouseDown={swallow} />
      <div style={{ ...maskBase, top: holeTop, left: holeRight, right: 0, height: holeH }} onClick={swallow} onMouseDown={swallow} />
      <div style={{ ...maskBase, top: holeBottom, left: 0, right: 0, bottom: 0 }} onClick={swallow} onMouseDown={swallow} />

      {current.readOnly && (
        <div
          style={{
            position: 'fixed',
            top: holeTop,
            left: holeLeft,
            width: holeW,
            height: holeH,
            background: 'transparent',
            pointerEvents: 'auto',
            zIndex: 499,
            cursor: 'not-allowed',
          }}
          onClick={swallow}
          onMouseDown={swallow}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: holeTop,
          left: holeLeft,
          width: holeW,
          height: holeH,
          border: `2px solid ${M.ac}`,
          borderRadius: 10,
          boxShadow: `0 0 0 4px ${M.ac}33, 0 0 22px ${M.ac}66`,
          pointerEvents: 'none',
          zIndex: 500,
          animation: 'introPulse 1.8s ease-in-out infinite',
        }}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-tooltip-title"
        tabIndex={-1}
        className="intro-in"
        style={{
          position: 'fixed',
          top: tooltipTop,
          left: tooltipLeft,
          maxWidth: tooltipMaxW,
          background: M.s1,
          border: `1px solid ${M.b1}`,
          borderRadius: 12,
          padding: '12px 14px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          zIndex: 501,
          color: M.t1,
        }}
      >
        <div style={{ fontSize: 10, color: M.t3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
          Step {step} of {steps.length - 2}
        </div>
        <div id="intro-tooltip-title" style={{ fontSize: 14, fontWeight: 700, color: M.t1, marginBottom: 4 }}>{current.title}</div>
        <div style={{ fontSize: 12, color: M.t2, lineHeight: 1.45, marginBottom: current.hint ? 4 : 10 }}>{current.body}</div>
        {current.hint && (
          <div style={{ fontSize: 11, color: M.t3, fontStyle: 'italic', marginBottom: 10 }}>{current.hint}</div>
        )}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onSkip}
            style={{ background: 'none', border: 'none', color: M.t3, fontSize: 10, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            Skip tour
          </button>
          {current.needsManualNext && (
            <button
              onClick={onAdvance}
              disabled={!canAdvance}
              style={{
                padding: '6px 12px',
                background: canAdvance ? M.btn : M.s2,
                color: canAdvance ? '#fff' : M.t3,
                border: 'none',
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 700,
                cursor: canAdvance ? 'pointer' : 'not-allowed',
              }}
            >
              {current.nextLabel || 'Next →'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
