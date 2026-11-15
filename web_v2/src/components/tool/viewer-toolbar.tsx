import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MoveHorizontal, ZoomIn, ZoomOut } from "lucide-react";
import type { ToolDict } from "@/lib/tool-i18n";
import { cn } from "@/lib/utils";
import { MAX_SCALE, MIN_SCALE, clampScale } from "./zoom";

type Labels = Pick<
  ToolDict,
  "prevPage" | "nextPage" | "currentPage" | "zoomIn" | "zoomOut" | "fitWidth"
>;

interface Props {
  page: number;
  numPages: number;
  scale: number;
  onPageChange: (page: number) => void;
  onScaleChange: (scale: number) => void;
  onFitWidth: () => void;
  labels: Labels;
  className?: string;
}

/** Barra única de navegação + zoom, fixa no topo da área do PDF. */
export function ViewerToolbar(props: Props) {
  const { page, numPages, scale, onPageChange, onScaleChange, onFitWidth, labels } = props;
  const step = (delta: number) => onScaleChange(clampScale(+(scale + delta).toFixed(1)));

  return (
    <div
      className={cn(
        "flex w-fit items-center gap-0.5 rounded-2xl border border-border bg-card/95 p-1 shadow-sm backdrop-blur",
        props.className,
      )}
    >
      <ToolbarButton
        label={labels.prevPage}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </ToolbarButton>
      <PageInput
        page={page}
        numPages={numPages}
        label={labels.currentPage}
        onCommit={onPageChange}
      />
      <ToolbarButton
        label={labels.nextPage}
        disabled={page >= numPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <ToolbarButton
        label={labels.zoomOut}
        disabled={scale <= MIN_SCALE}
        onClick={() => step(-0.1)}
      >
        <ZoomOut className="h-4 w-4" />
      </ToolbarButton>
      <span
        className="min-w-[3.25rem] text-center font-mono text-xs tabular-nums"
        aria-live="polite"
      >
        {Math.round(scale * 100)}%
      </span>
      <ToolbarButton label={labels.zoomIn} disabled={scale >= MAX_SCALE} onClick={() => step(0.1)}>
        <ZoomIn className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label={labels.fitWidth} onClick={onFitWidth}>
        <MoveHorizontal className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

interface ToolbarButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolbarButton(props: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label={props.label}
      title={props.label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/80 transition hover:bg-secondary hover:text-ink disabled:pointer-events-none disabled:opacity-30"
    >
      {props.children}
    </button>
  );
}

interface PageInputProps {
  page: number;
  numPages: number;
  label: string;
  onCommit: (page: number) => void;
}

/** Campo de página com rascunho local: só navega no Enter/blur, não a cada tecla. */
function PageInput(props: PageInputProps) {
  const { page, numPages, label, onCommit } = props;
  const [draft, setDraft] = useState(String(page));

  useEffect(() => setDraft(String(page)), [page]);

  const commit = () => {
    const n = Math.min(numPages, Math.max(1, Math.floor(Number(draft)) || page));
    setDraft(String(n));
    if (n !== page) onCommit(n);
  };

  return (
    <div className="flex items-center gap-1 px-1 font-mono text-xs tabular-nums">
      <input
        type="text"
        inputMode="numeric"
        value={draft}
        aria-label={label}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="h-7 w-10 rounded-md border border-border bg-secondary text-center outline-none focus:border-ink"
      />
      <span className="text-ink/50">/ {numPages}</span>
    </div>
  );
}
