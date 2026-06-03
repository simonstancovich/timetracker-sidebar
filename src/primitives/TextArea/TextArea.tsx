import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import * as s from "./TextArea.css";

interface Props extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "style"> {
  invalid?: boolean;
  fullWidth?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, Props>(function TextArea(
  { invalid = false, fullWidth = false, className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cx(s.root, invalid && s.invalid, fullWidth && s.fullWidth, className)}
      {...rest}
      aria-invalid={invalid || rest["aria-invalid"]}
    />
  );
});
