"use client";
import { cn } from "@/lib/cn";

interface ToggleProps {
  on: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ on, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0",
        on ? "bg-brand" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
          on && "translate-x-4"
        )}
      />
    </button>
  );
}

interface FieldRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function FieldRow({ label, hint, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

interface NotifRowProps {
  label: string;
  desc?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}

export function NotifRow({ label, desc, on, onChange }: NotifRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}
