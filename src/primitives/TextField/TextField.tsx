import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import * as s from "./TextField.css";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "style"> {
  serif?: boolean;
  filled?: boolean;
  invalid?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { serif = false, filled = false, invalid = false, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cx(
        s.root,
        serif && s.serif,
        filled && s.filled,
        invalid && s.invalid,
        className,
      )}
      {...rest}
      aria-invalid={invalid || rest["aria-invalid"]}
    />
  );
});
