interface Props {
  size?: number | string;
  className?: string;
}

export function ChevronLeftIcon({ size = 14, className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
