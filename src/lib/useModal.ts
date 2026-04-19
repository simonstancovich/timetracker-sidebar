import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

// Adds standard modal keyboard behavior: Escape to close, Tab/Shift+Tab
// cycles focus within the container, focus moves to the first focusable on
// open and is restored to the previously-focused element on close.
export function useModal<T extends HTMLElement>({
  enabled,
  onClose,
}: {
  enabled: boolean
  onClose: () => void
}) {
  const containerRef = useRef<T | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled) return
    previouslyFocused.current = document.activeElement as HTMLElement | null

    const raf = requestAnimationFrame(() => {
      const node = containerRef.current
      if (!node) return
      const els = node.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (els.length > 0) els[0].focus()
      else node.focus()
    })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const node = containerRef.current
      if (!node) return
      const els: HTMLElement[] = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (els.length === 0) { e.preventDefault(); return }
      const first = els[0]!
      const last = els[els.length - 1]!
      const active = document.activeElement as HTMLElement | null
      if (!active || !node.contains(active)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      const prev = previouslyFocused.current
      if (prev && document.contains(prev)) {
        try { prev.focus() } catch { /* ignore */ }
      }
    }
  }, [enabled, onClose])

  return containerRef
}
