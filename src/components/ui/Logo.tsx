import { FilePdf } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

interface LogoProps {
  size?: number;
  showText?: boolean;
  mono?: boolean;
  className?: string;
}

export function Logo({ size = 30, showText = true, mono = false, className }: LogoProps) {
  const iconSize = Math.round(size * 0.52);
  const fontSize = Math.round(size * 0.53);
  const radius = Math.round(size * 0.28);

  const mark = (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0",
        mono ? "bg-white" : "bg-brand shadow-brand"
      )}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <FilePdf
        size={iconSize}
        weight="bold"
        className={mono ? "text-brand" : "text-white"}
      />
    </span>
  );

  if (!showText) return mark;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {mark}
      <span
        className={cn("font-extrabold tracking-[-0.3px]", mono ? "text-white" : "text-slate-900")}
        style={{ fontSize }}
      >
        Active<span className={mono ? "text-brand-light" : "text-brand"}>PDF</span>
      </span>
    </span>
  );
}
