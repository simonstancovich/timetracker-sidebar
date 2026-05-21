import { cx } from '../../lib/cx'
import * as s from './Skeleton.css'

export type SkeletonHeight = keyof typeof s.height
export type SkeletonWidth = keyof typeof s.width
export type SkeletonRadius = keyof typeof s.radius

interface Props {
  height?: SkeletonHeight
  width?: SkeletonWidth
  radius?: SkeletonRadius
  inline?: boolean
  className?: string
}

export function Skeleton({
  height = 'md',
  width,
  radius = 'md',
  inline = false,
  className,
}: Props) {
  const classes = cx(
    'skeleton',
    s.height[height],
    width && s.width[width],
    s.radius[radius],
    className,
  )
  return inline ? <span className={classes} /> : <div className={classes} />
}
