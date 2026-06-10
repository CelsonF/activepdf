import React from "react";
import { cn } from "@/lib/cn";
import { CursorText, SlidersHorizontal } from "@phosphor-icons/react";

export function PropField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.5px] mb-[5px]">
        {label}
      </label>
      {children}
    </div>
  );
}

export function SectionLabel({
  className,
  borderTop,
  children,
}: {
  className?: string;
  borderTop?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "text-[10px] font-bold uppercase tracking-[0.5px] px-1 pt-[6px] pb-[5px]",
        borderTop ? "mt-2 border-t border-slate-200" : "mt-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <span className="font-normal text-slate-400">{children}</span>;
}

export function EmptyState({
  message,
  hint,
  icon,
}: {
  message: string;
  hint: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-center py-9 px-3 text-slate-400">
      {icon && (
        <div className="mb-3 flex justify-center opacity-40">
          {icon}
        </div>
      )}
      <div className="text-xs font-semibold text-slate-500">{message}</div>
      <div className="text-[11px] mt-[5px] leading-[1.5]">{hint}</div>
    </div>
  );
}

export function FieldIcon() {
  return <CursorText size={32} className="text-slate-300" />;
}

export function PropsIcon() {
  return <SlidersHorizontal size={32} className="text-slate-300" />;
}
