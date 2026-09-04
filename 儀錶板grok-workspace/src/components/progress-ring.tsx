import { cn } from "@/lib/utils";

export function ProgressRing({
  value,
  size = 44,
  stroke = 3.5,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0 -rotate-90", className)}
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-border-strong"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - clamped)}
        className="text-accent"
      />
    </svg>
  );
}
