import type { ToolDict } from "@/lib/tool-i18n";

interface Props {
  labels: Pick<ToolDict, "shortcuts" | "kbdDelete" | "kbdDeselect" | "kbdNudge" | "kbdSave">;
}

function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}

/** Legenda compacta dos atalhos do editor (escondida em telas de toque). */
export function ShortcutHints(props: Props) {
  const { labels } = props;
  const rows: ReadonlyArray<{ keys: string; label: string }> = [
    { keys: "Del", label: labels.kbdDelete },
    { keys: "Esc", label: labels.kbdDeselect },
    { keys: "← ↑ → ↓", label: labels.kbdNudge },
    { keys: isMac() ? "⌘ S" : "Ctrl S", label: labels.kbdSave },
  ];

  return (
    <div className="mt-4 hidden lg:block">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {labels.shortcuts}
      </div>
      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5 text-[11px] text-ink/60">
        {rows.map((row) => (
          <div key={row.keys} className="contents">
            <dt>
              <kbd className="rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-ink/80">
                {row.keys}
              </kbd>
            </dt>
            <dd>{row.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
