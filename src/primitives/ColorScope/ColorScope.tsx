import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> {
  color: string;
  children: ReactNode;
}

export const ColorScope = forwardRef<HTMLDivElement, Props>(function ColorScope(
  { color, className, children, ...rest },
  ref,
) {
  // Publishes a data-driven color to descendants as --scope-color (a value a styleVariant can't express).
  return (
    <div
      ref={ref}
      {...rest}
      className={className}
      style={{ "--scope-color": color } as CSSProperties}
    >
      {children}
    </div>
  );
});
