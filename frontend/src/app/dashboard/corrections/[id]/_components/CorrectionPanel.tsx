"use client";
import { ClipboardText, FloppyDisk, Warning } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { FieldCorrectionCard } from "./FieldCorrectionCard";
import type { CorrectionState, FieldItem } from "./correction-types";

const GRADES = ["A+", "A", "B+", "B", "C", "D", "F"] as const;

interface CorrectionPanelProps {
  items: FieldItem[];
  corrections: Record<string, CorrectionState>;
  grade: string;
  comment: string;
  saving: boolean;
  saved: boolean;
  onGrade: (g: string) => void;
  onComment: (v: string) => void;
  onToggleCorrect: (fieldId: string, value: boolean) => void;
  onFeedback: (fieldId: string, text: string) => void;
  onSave: () => void;
}

export function CorrectionPanel({
  items, corrections, grade, comment, saving, saved,
  onGrade, onComment, onToggleCorrect, onFeedback, onSave,
}: CorrectionPanelProps) {
  const correctedCount = Object.values(corrections).filter((c) => c.correct !== null).length;

  return (
    <div className="w-[400px] shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardText size={15} weight="bold" className="text-amber-500" />
            <p className="text-sm font-bold text-slate-800">Correção</p>
          </div>
          <span className="text-xs text-slate-400 tabular-nums">
            {correctedCount}/{items.length} campos
          </span>
        </div>

        <div className="mb-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
            Nota
          </label>
          <div className="flex flex-wrap gap-1.5">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => onGrade(grade === g ? "" : g)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold border transition-colors",
                  grade === g
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-slate-600 border-slate-200 hover:border-brand/50 hover:text-brand"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
            Comentário geral
          </label>
          <textarea
            value={comment}
            onChange={(e) => onComment(e.target.value)}
            placeholder="Feedback para o aluno..."
            className="ui-input resize-none text-xs leading-relaxed"
            rows={2}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Warning size={28} className="mx-auto mb-2" />
            <p className="text-xs">Este exercício não tem campos definidos.</p>
          </div>
        ) : (
          items.map((field) => (
            <FieldCorrectionCard
              key={field.id}
              field={field}
              state={corrections[field.id]}
              onToggle={(value) => onToggleCorrect(field.id, value)}
              onFeedback={(text) => onFeedback(field.id, text)}
            />
          ))
        )}
      </div>

      <div className="px-5 py-4 border-t border-slate-100 shrink-0">
        <button
          onClick={onSave}
          disabled={saving}
          className={cn(
            "ui-btn ui-btn-md w-full gap-1.5 transition-all",
            saved ? "ui-btn-success" : "ui-btn-primary"
          )}
        >
          {saving ? (
            <span className="ui-spinner w-3.5 h-3.5 border-2 text-white" />
          ) : (
            <FloppyDisk size={14} weight="bold" />
          )}
          {saved ? "Salvo!" : saving ? "Salvando..." : "Salvar correção"}
        </button>
        {saved && (
          <p className="text-[11px] text-center text-emerald-600 mt-2 font-medium">
            Correção salva · status atualizado para &ldquo;corrigido&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
