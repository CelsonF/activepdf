import { CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

interface StepIndicatorProps {
  labels: string[];
  step: number;
}

export function StepIndicator({ labels, step }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold transition-all",
              i < step
                ? "bg-brand text-white"
                : i === step
                ? "bg-brand text-white ring-4 ring-brand/20"
                : "bg-slate-200 text-slate-500"
            )}
          >
            {i < step ? <CheckCircle size={13} weight="fill" /> : i + 1}
          </div>
          <span className={cn("text-xs font-medium", i === step ? "text-slate-800" : "text-slate-400")}>
            {label}
          </span>
          {i < labels.length - 1 && (
            <div className={cn("w-8 h-px ml-1", i < step ? "bg-brand" : "bg-slate-200")} />
          )}
        </div>
      ))}
    </div>
  );
}
