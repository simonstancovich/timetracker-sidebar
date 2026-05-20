interface Props {
  size?: number | string;
  className?: string;
}

export function FlameIcon({ size = 14, className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2c0 3-2 5-2 7 0 1 .4 1.7 1 2.3-.6.4-1 1-1 2 0 1.4 1.1 2.5 2.5 2.5 1.7 0 3-1.4 3-3.1 0-1.6-1-2.8-2-4 0 0 4 1.7 4 6.3a6.5 6.5 0 1 1-13 0c0-3 2.5-4.5 3.5-6.7C8.6 6.4 9 4.3 12 2z" />
    </svg>
  );
}
