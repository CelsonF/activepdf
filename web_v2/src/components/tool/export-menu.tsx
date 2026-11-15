import { useEffect, useState } from "react";
import { ChevronDown, Download, FileImage, FileText, SquarePen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ToolDict } from "@/lib/tool-i18n";

type Labels = Pick<
  ToolDict,
  | "export"
  | "openMenu"
  | "menuLabel"
  | "exportFilled"
  | "exportTemplate"
  | "exportPagePng"
  | "exportRange"
  | "pageStart"
  | "pageEnd"
  | "to"
  | "exportBtn"
>;

interface Props {
  disabled: boolean;
  numPages: number;
  onExportFilled: () => void;
  onExportTemplate: () => void;
  onExportPng: () => void;
  onExportRange: (start: number, end: number) => void;
  labels: Labels;
}

/** CTA carmim de exportação com as opções em popover (Radix cuida de foco, Esc e clique fora). */
export function ExportMenu(props: Props) {
  const { disabled, numPages, labels } = props;
  const [open, setOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState("1");
  const [rangeEnd, setRangeEnd] = useState("1");

  useEffect(() => {
    setRangeStart("1");
    setRangeEnd(String(numPages || 1));
  }, [numPages]);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={labels.openMenu}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50 sm:px-3.5 sm:text-sm"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only sm:not-sr-only">{labels.export}</span>
          <ChevronDown className="h-3 w-3" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label={labels.menuLabel}
        className="w-[18rem] max-w-[calc(100vw-1.5rem)] rounded-xl border-border bg-card p-1 shadow-lg"
      >
        <MenuItem
          icon={FileText}
          label={labels.exportFilled}
          onClick={() => run(props.onExportFilled)}
        />
        <MenuItem
          icon={SquarePen}
          label={labels.exportTemplate}
          onClick={() => run(props.onExportTemplate)}
        />
        <MenuItem
          icon={FileImage}
          label={labels.exportPagePng}
          onClick={() => run(props.onExportPng)}
        />
        <div className="my-1 h-px bg-border" role="separator" />
        <div className="px-2.5 py-2">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {labels.exportRange}
          </div>
          <div className="flex items-center gap-1.5">
            <RangeInput
              id="range-start"
              label={labels.pageStart}
              value={rangeStart}
              max={numPages}
              onChange={setRangeStart}
            />
            <span className="text-xs text-ink/50">{labels.to}</span>
            <RangeInput
              id="range-end"
              label={labels.pageEnd}
              value={rangeEnd}
              max={numPages}
              onChange={setRangeEnd}
            />
            <span className="text-xs text-ink/50">/ {numPages}</span>
            <button
              type="button"
              onClick={() =>
                run(() => props.onExportRange(Number(rangeStart) || 1, Number(rangeEnd) || 1))
              }
              className="ml-auto inline-flex min-h-8 items-center rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              {labels.exportBtn}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}

function MenuItem(props: MenuItemProps) {
  const Icon = props.icon;
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink outline-none hover:bg-secondary focus-visible:bg-secondary"
    >
      <Icon className="h-4 w-4 text-ink/60" />
      {props.label}
    </button>
  );
}

interface RangeInputProps {
  id: string;
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
}

function RangeInput(props: RangeInputProps) {
  return (
    <>
      <label className="sr-only" htmlFor={props.id}>
        {props.label}
      </label>
      <input
        id={props.id}
        type="number"
        min={1}
        max={props.max || 1}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-14 rounded-lg border border-border bg-secondary px-2 py-1 text-center text-xs outline-none focus:border-ink"
      />
    </>
  );
}
