import { vars } from "../theme";

interface Props {
  size?: number | string;
  ringClassName?: string;
  checkClassName?: string;
}

export function SuccessCheckIcon({ size = 72, ringClassName, checkClassName }: Props) {
  return (
    <svg
      viewBox="0 0 72 72"
      width={size}
      height={size}
      fill="none"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke={vars.typography.green}
      aria-hidden
    >
      <circle
        className={ringClassName}
        cx="36"
        cy="36"
        r="31"
        strokeDasharray="195"
        strokeDashoffset="195"
        transform="rotate(-90 36 36)"
      />
      <polyline
        className={checkClassName}
        points="22 38 32 48 52 26"
        strokeDasharray="40"
        strokeDashoffset="40"
      />
    </svg>
  );
}
