import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import * as prim from '../primitives'
import * as s from './AppLayout.css'

interface Props {
  themeClass: string
  mode: 'light' | 'dark'
  topLeftCorner?: ReactNode
  header: ReactNode
  banners?: ReactNode
  footer: ReactNode
  overlays?: ReactNode
  modeOverlay?: ReactNode
  children: ReactNode
}

export function AppLayout({
  themeClass,
  mode,
  topLeftCorner,
  header,
  banners,
  footer,
  overlays,
  modeOverlay,
  children,
}: Props) {
  return (
    <>
      <prim.Stack
        key="mode-full"
        position="relative"
        viewportHeight
        overflowY="hidden"
        className={cx(
          s.root,
          s.modeVariant[mode],
          themeClass,
          'mode-root',
          mode === 'dark' && 'app-dark-glow',
        )}
      >
        {topLeftCorner}
        {header}
        {banners}
        <prim.Stack flex1 minHeight0 overflowY="auto">{children}</prim.Stack>
        {footer}
        {overlays}
      </prim.Stack>
      {modeOverlay}
    </>
  )
}
