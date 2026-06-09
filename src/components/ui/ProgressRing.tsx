import { cn } from "@/lib/cn";

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ProgressRing({
  value,
  size = 96,
  stroke = 9,
  color = "#4f46e5",
  track = "#e2e8f0",
  children,
  className,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <span
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={track} strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      {children && (
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </span>
      )}
    </span>
  );
}
