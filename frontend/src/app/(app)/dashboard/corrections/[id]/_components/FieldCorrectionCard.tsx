"use client";
import { Check, X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { CorrectionState, FieldItem } from "./correction-types";

interface FieldCorrectionCardProps {
  field: FieldItem;
  state: CorrectionState;
  onToggle: (value: boolean) => void;
  onFeedback: (text: string) => void;
}

export function FieldCorrectionCard({ field, state, onToggle, onFeedback }: FieldCorrectionCardProps) {
  const hasAnswer =
    field.studentAnswer !== null &&
    field.studentAnswer !== "" &&
    field.studentAnswer !== undefined;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        state.correct === true && "border-emerald-200 bg-emerald-50",
        state.correct === false && "border-red-200 bg-red-50",
        state.correct === null && "border-slate-200 bg-slate-50"
      )}
    >
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">
        {field.label}
      </p>

      {hasAnswer ? (
        <div className="text-sm text-slate-800 font-medium mb-2.5 bg-white rounded-lg px-3 py-2 border border-slate-200 leading-relaxed">
          {field.type === "checkbox"
            ? field.studentAnswer
              ? "✓ Marcado"
              : "☐ Não marcado"
            : String(field.studentAnswer)}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic mb-2.5">Sem resposta</p>
      )}

      <div className="flex gap-2 mb-2">
        <button
          onClick={() => onToggle(true)}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border",
            state.correct === true
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
          )}
        >
          <Check size={12} weight="bold" /> Correto
        </button>
        <button
          onClick={() => onToggle(false)}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border",
            state.correct === false
              ? "bg-red-500 text-white border-red-500"
              : "bg-white text-slate-500 border-slate-200 hover:border-red-300 hover:text-red-500"
          )}
        >
          <X size={12} weight="bold" /> Incorreto
        </button>
      </div>

      <input
        type="text"
        value={state.feedback}
        onChange={(e) => onFeedback(e.target.value)}
        placeholder="Feedback opcional..."
        className="ui-input text-xs"
      />
    </div>
  );
}
