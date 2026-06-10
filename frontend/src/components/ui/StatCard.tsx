import { cn } from "@/lib/cn";

interface StatCardProps {
  icon: React.ReactNode;
  iconBg?: string;
  value: string;
  label: string;
  delta?: string;
  deltaDir?: "up" | "down";
  className?: string;
}

export function StatCard({
  icon,
  iconBg = "bg-brand-light",
  value,
  label,
  delta,
  deltaDir = "up",
  className,
}: StatCardProps) {
  return (
    <div className={cn("p-4 bg-white rounded-2xl border border-slate-200 shadow-card", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg)}>
          {icon}
        </span>
        {delta && (
          <span
            className={cn(
              "text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
              deltaDir === "up"
                ? "text-emerald-700 bg-emerald-50"
                : "text-red-700 bg-red-50"
            )}
          >
            {deltaDir === "up" ? "↑" : "↓"} {delta}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none mb-1">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
