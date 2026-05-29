import { forwardRef, type InputHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import * as s from './TextInput.css'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  filled?: boolean
  invalid?: boolean
  trailingSpace?: boolean
  fullWidth?: boolean
}

export const TextInput = forwardRef<HTMLInputElement, Props>(function TextInput(
  {
    filled = false,
    invalid = false,
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
        invalid && s.invalid,
        trailingSpace && s.trailingSpace,
        fullWidth && s.fullWidth,
        className,
      )}
      {...rest}
      aria-invalid={invalid || rest['aria-invalid']}
    />
  )
})
