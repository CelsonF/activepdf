import { cn } from "@/lib/cn";

interface SpecTagProps {
  children: React.ReactNode;
  className?: string;
}

/** Etiqueta de redline (visível só em inspect mode). */
export function SpecTag({ children, className }: SpecTagProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "pf-spec pointer-events-none absolute z-30 whitespace-nowrap rounded-sm bg-pf-red px-1.5 py-0.5 font-pfmono text-[10px] font-medium leading-none text-white",
        className
      )}
    >
      {children}
    </span>
  );
}

interface SpecGapProps {
  value: string;
  className?: string;
  hover?: boolean;
}

/** Linha de medição horizontal com o valor ao centro. */
export function SpecGap({ value, className, hover = false }: SpecGapProps) {
  return (
    <span
      aria-hidden
      className={cn(
        hover ? "pf-hoverspec" : "pf-spec",
        "pointer-events-none absolute z-30 flex items-center gap-1.5 text-pf-red",
        className
      )}
    >
      <span className="h-px flex-1 border-t border-dashed border-pf-red" />
      <span className="font-pfmono text-[10px] font-medium leading-none">{value}</span>
      <span className="h-px flex-1 border-t border-dashed border-pf-red" />
    </span>
  );
}
