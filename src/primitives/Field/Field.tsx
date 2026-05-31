import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { FieldLabel, type FieldLabelTone } from '../FieldLabel/FieldLabel'

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'children'> {
  label: string
  tone?: FieldLabelTone
  children: ReactNode
}

export const Field = forwardRef<HTMLDivElement, Props>(function Field(
  { label, tone, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} {...rest}>
      <FieldLabel tone={tone}>{label}</FieldLabel>
      {children}
    </div>
  )
})
