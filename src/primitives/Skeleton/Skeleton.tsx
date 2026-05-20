import { cx } from '../../lib/cx'
import * as s from './Skeleton.css'

export type SkeletonHeight = keyof typeof s.height
export type SkeletonRadius = keyof typeof s.radius

interface Props {
  height?: SkeletonHeight
  radius?: SkeletonRadius
  inline?: boolean
  className?: string
}

export function Skeleton({
  height = 'md',
  radius = 'md',
  inline = false,
  className,
}: Props) {
  const classes = cx('skeleton', s.height[height], s.radius[radius], className)
  return inline ? <span className={classes} /> : <div className={classes} />
}
