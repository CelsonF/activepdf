import { cn } from "@/lib/cn";
import { STATUS_COLOR, STATUS_LABEL } from "./dashboard-shared";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
        STATUS_COLOR[status] ?? "bg-slate-50 text-slate-500 border-slate-200"
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
