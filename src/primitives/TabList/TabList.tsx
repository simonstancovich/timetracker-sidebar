import { useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import * as s from './TabList.css'

export type TabListOrientation = 'horizontal' | 'vertical'

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'style'> {
  orientation?: TabListOrientation
  children: ReactNode
}

export function TabList({
  orientation = 'horizontal',
  className,
  children,
  onKeyDown,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const classes = cx(s.root, orientation === 'vertical' && s.vertical, className)

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    if (e.key !== nextKey && e.key !== prevKey && e.key !== 'Home' && e.key !== 'End') return
    const tabs = Array.from(
      ref.current?.querySelectorAll<HTMLElement>('[role="tab"]:not([aria-disabled="true"])') ?? [],
    )
    if (tabs.length === 0) return
    e.preventDefault()
    const activeIdx = tabs.findIndex((t) => t === document.activeElement)
    const lastIdx = tabs.length - 1
    let nextIdx = activeIdx
    if (e.key === nextKey) nextIdx = activeIdx < 0 ? 0 : (activeIdx + 1) % tabs.length
    else if (e.key === prevKey) nextIdx = activeIdx <= 0 ? lastIdx : activeIdx - 1
    else if (e.key === 'Home') nextIdx = 0
    else if (e.key === 'End') nextIdx = lastIdx
    tabs[nextIdx]?.focus()
  }

  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      {...rest}
      className={classes}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}
