import { useCallback, useRef, useState } from 'react'
import { monthEnded } from '../api'

export interface MonthClosureCache {
  isClosed: (year: number, month: number) => boolean | null
  ensure: (year: number, month: number) => void
  setClosed: (year: number, month: number, value: boolean) => void
}

const key = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, '0')}`

export function useMonthClosure(): MonthClosureCache {
  const [map, setMap] = useState<Record<string, boolean>>({})
  const mapRef = useRef(map)
  mapRef.current = map
  const inFlight = useRef<Set<string>>(new Set())

  const ensure = useCallback((y: number, m: number) => {
    const k = key(y, m)
    if (k in mapRef.current || inFlight.current.has(k)) return
    inFlight.current.add(k)
    monthEnded(new Date(y, m, 1))
      .then((ended) => setMap((prev) => ({ ...prev, [k]: ended })))
      .catch(() => {})
      .finally(() => { inFlight.current.delete(k) })
  }, [])

  const isClosed = useCallback(
    (y: number, m: number): boolean | null => {
      const k = key(y, m)
      return k in map ? map[k] : null
    },
    [map],
  )

  const setClosed = useCallback((y: number, m: number, value: boolean) => {
    setMap((prev) => ({ ...prev, [key(y, m)]: value }))
  }, [])

  return { isClosed, ensure, setClosed }
}
