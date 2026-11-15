import { Calendar, CheckSquare, Hash, Type } from "lucide-react";
import type { ToolDict } from "@/lib/tool-i18n";

type FieldKind = "text" | "checkbox" | "date" | "number";

const FIELD_ICONS: Record<FieldKind, React.ComponentType<{ className?: string }>> = {
  text: Type,
  checkbox: CheckSquare,
  date: Calendar,
  number: Hash,
};

interface FieldSummary {
  id: string;
  type: FieldKind;
  label: string;
  value: string;
}

interface Props {
  fields: readonly FieldSummary[];
  onSelect: (id: string) => void;
  labels: Pick<ToolDict, "fieldsOnPage" | "noFieldsOnPage" | "emptyValue">;
}

/** Lista dos campos da página atual — aparece no painel quando nenhum campo está selecionado. */
export function FieldList(props: Props) {
  const { fields, onSelect, labels } = props;

  if (fields.length === 0) {
    return <p className="text-xs leading-relaxed text-ink/50">{labels.noFieldsOnPage}</p>;
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-ink/60">
        <span>{labels.fieldsOnPage}</span>
        <span className="font-mono text-[11px] text-ink/40">{fields.length}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {fields.map((fd) => {
          const Icon = FIELD_ICONS[fd.type];
          const value = fd.type === "checkbox" ? (fd.value === "true" ? "✓" : "") : fd.value;
          return (
            <li key={fd.id}>
              <button
                type="button"
                onClick={() => onSelect(fd.id)}
                className="flex w-full items-center gap-2 rounded-xl border border-transparent px-2.5 py-2 text-left text-xs transition hover:border-border hover:bg-secondary"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-ink/50" />
                <span className="min-w-0 flex-1 truncate font-medium text-ink">{fd.label}</span>
                <span className="max-w-[45%] truncate text-ink/50">
                  {value || <em className="not-italic text-ink/30">{labels.emptyValue}</em>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
