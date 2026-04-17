import { useEffect, useRef } from 'react'

const WINDOW_MS = 700
const MIN_REVERSALS = 3
const MIN_TRAVEL_PX = 140
const MIN_SEGMENT_PX = 5
const COOLDOWN_MS = 1000

type Sample = { x: number; y: number; t: number }

function countReversals(buf: Sample[], axis: 'x' | 'y') {
  let reversals = 0
  let travel = 0
  let lastDir = 0
  let run = 0
  for (let i = 1; i < buf.length; i++) {
    const d = buf[i][axis] - buf[i - 1][axis]
    if (d === 0) continue
    travel += Math.abs(d)
    run += d
    if (Math.abs(run) < MIN_SEGMENT_PX) continue
    const dir = run > 0 ? 1 : -1
    if (lastDir !== 0 && dir !== lastDir) reversals++
    lastDir = dir
    run = 0
  }
  return { reversals, travel }
}

export function useShakeDismiss() {
  const samples = useRef<Sample[]>([])
  const cooldownUntil = useRef(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = performance.now()
      if (now < cooldownUntil.current) return

      const buf = samples.current
      buf.push({ x: e.clientX, y: e.clientY, t: now })
      while (buf.length && buf[0].t < now - WINDOW_MS) buf.shift()
      if (buf.length < 6) return

      const rx = countReversals(buf, 'x')
      const ry = countReversals(buf, 'y')
      const reversals = Math.max(rx.reversals, ry.reversals)
      const travel = rx.travel + ry.travel

      if (reversals >= MIN_REVERSALS && travel >= MIN_TRAVEL_PX) {
        cooldownUntil.current = now + COOLDOWN_MS
        samples.current = []
        window.electronAPI.shakeDismiss?.()
      }
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
}
