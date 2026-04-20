import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const getFocusable = (node: HTMLElement): HTMLElement[] =>
  Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))

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

  // Stash onClose in a ref so the effect depends only on `enabled`. If we
  // instead listed onClose in the deps, a fresh closure from the parent on
  // every render would tear down + rebuild the listener and yank focus back
  // on every render tick.
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    if (!enabled) return
    previouslyFocused.current = document.activeElement as HTMLElement | null

    const raf = requestAnimationFrame(() => {
      const node = containerRef.current
      if (!node) return
      const els = getFocusable(node)
      if (els.length > 0) els[0]!.focus()
      else node.focus()
    })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const node = containerRef.current
      if (!node) return
      const els = getFocusable(node)
      if (els.length === 0) { e.preventDefault(); return }
      const first = els[0]!
      const last = els[els.length - 1]!
      const active = document.activeElement as HTMLElement | null
      const inside = active && node.contains(active)
      const shouldWrap = !inside || (e.shiftKey ? active === first : active === last)
      if (shouldWrap) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      const prev = previouslyFocused.current
      if (prev && document.contains(prev)) {
        try { prev.focus() } catch { /* detached element, ignore */ }
      }
    }
  }, [enabled])

  return containerRef
}
