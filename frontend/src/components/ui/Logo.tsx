import { Highlighter } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

interface LogoProps {
  size?: number;
  showText?: boolean;
  mono?: boolean;
  className?: string;
}

/**
 * Wordmark "Grifo": display + grifo de marca-texto (.ui-marker).
 * `mono` é a versão para fundos escuros — sem o grifo, que não lê sobre escuro.
 */
export function Logo({ size = 30, showText = true, mono = false, className }: LogoProps) {
  const iconSize = Math.round(size * 0.58);
  const fontSize = Math.round(size * 0.56);
  const radius = Math.round(size * 0.24);

  const mark = (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0",
        mono ? "bg-white" : "bg-ink"
      )}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Highlighter
        size={iconSize}
        weight="fill"
        className={mono ? "text-ink" : "text-marker"}
      />
    </span>
  );

  if (!showText) return mark;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {mark}
      <span
        className={cn(
          "font-display font-bold tracking-[-0.02em]",
          mono ? "text-white" : "text-ink"
        )}
        style={{ fontSize }}
      >
        {mono ? "Grifo" : <span className="ui-marker">Grifo</span>}
      </span>
    </span>
  );
}
