import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './ActivityRing.css'

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  progress: number
  done: boolean
  size?: number
  stroke?: number
  withTicks?: boolean
  children: ReactNode
}

const TICK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const
const MAJOR_TICK_RATIO = 0.05
const MINOR_TICK_RATIO = 0.035
const MAJOR_TICK_MIN = 1.5
const MINOR_TICK_MIN = 1
const TICK_OFFSET_PAD = 0.5

export const ActivityRing = forwardRef<HTMLDivElement, Props>(function ActivityRing(
  { progress, done, size = 38, stroke = 3, withTicks = false, className, children, ...rest },
  ref,
) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, progress))
  const offset = circ * (1 - clamped)
  const center = size / 2
  const tickOffset = stroke + TICK_OFFSET_PAD
  const majorLen = Math.max(MAJOR_TICK_MIN, size * MAJOR_TICK_RATIO)
  const minorLen = Math.max(MINOR_TICK_MIN, size * MINOR_TICK_RATIO)

  return (
    <div
      ref={ref}
      {...rest}
      className={cx(s.root, className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className={s.svg} aria-hidden>
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={s.track}
        />
        {withTicks && (
          <g>
            {TICK_ANGLES.map((angle, i) => {
              const isMajor = i % 2 === 0
              const len = isMajor ? majorLen : minorLen
              return (
                <line
                  key={angle}
                  x1={center}
                  y1={tickOffset}
                  x2={center}
                  y2={tickOffset + len}
                  className={isMajor ? s.tickMajor : s.tick}
                  transform={`rotate(${angle} ${center} ${center})`}
                />
              )
            })}
          </g>
        )}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className={done ? s.ringDone : s.ring}
        />
      </svg>
      <div className={s.content}>{children}</div>
    </div>
  )
})
