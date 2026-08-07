interface ProgressBarProps {
  /** 0..1 */
  value: number;
  /** Tailwind color class for the fill. Defaults to the brand gradient. */
  tone?: string;
  className?: string;
  ariaLabel?: string;
}

/** Rounded capsule progress bar with a smooth animated fill. */
export function ProgressBar({
  value,
  tone = "bg-gradient-to-r from-brand to-brand-2",
  className = "",
  ariaLabel,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={`h-2 w-full overflow-hidden rounded-full bg-line/60 dark:bg-white/10 ${className}`}
    >
      <div
        className={`h-full rounded-full ${tone} transition-[width] duration-500 ease-out`}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}
