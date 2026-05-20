import { forwardRef, type InputHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import * as s from './TextInput.css'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  // Visually emphasizes the input — heavier weight, primary text color,
  // accent border. Drive from parent state (e.g. "has a selection") rather
  // than relying on `:placeholder-shown`, since the two often diverge.
  filled?: boolean
  // Reserve extra right padding for an absolutely-positioned trailing
  // element (e.g. a clear button or icon).
  trailingSpace?: boolean
  fullWidth?: boolean
}

export const TextInput = forwardRef<HTMLInputElement, Props>(function TextInput(
  {
    filled = false,
    trailingSpace = false,
    fullWidth = false,
    type = 'text',
    className,
    ...rest
  },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cx(
        s.root,
        filled && s.filled,
        trailingSpace && s.trailingSpace,
        fullWidth && s.fullWidth,
        className,
      )}
      {...rest}
    />
  )
})
