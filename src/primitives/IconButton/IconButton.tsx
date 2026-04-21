import type { ButtonHTMLAttributes, ReactNode } from "react";
import * as s from "./IconButton.css";

export type IconButtonVariant = keyof typeof s.variant;
export type IconButtonSize = keyof typeof s.size;

interface Props extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "style" | "aria-label"
> {
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  type?: "button" | "submit" | "reset";
  children: ReactNode;
}

export function IconButton({
  variant = "soft",
  size = "sm",
  type = "button",
  className,
  children,
  ...rest
}: Props) {
  const classes = [s.root, s.variant[variant], s.size[size], className]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
