"use client";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { GOALS, LEVELS, type Goal, type Level } from "./register-data";

interface StudentGoalsStepProps {
  level: Level;
  onLevel: (l: Level) => void;
  goals: Goal[];
  onToggleGoal: (g: Goal) => void;
  canSubmit: boolean;
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function StudentGoalsStep({
  level, onLevel, goals, onToggleGoal, canSubmit, loading, onBack, onSubmit,
}: StudentGoalsStepProps) {
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Seus objetivos</h1>
      <p className="text-sm text-slate-500 mb-5">Selecione seu nível e o que quer praticar.</p>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-700 mb-2">Nível de inglês</label>
        <div className="grid grid-cols-6 gap-1.5">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => onLevel(l.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 rounded-lg border-2 text-center transition-all",
                level === l.id
                  ? "border-brand bg-brand-light"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <span className={cn("text-xs font-bold tabular-nums", level === l.id ? "text-brand" : "text-slate-700")}>
                {l.id}
              </span>
              <span className="text-[9px] text-slate-400 leading-tight">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-700 mb-2">O que quer praticar?</label>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onToggleGoal(g.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 text-left transition-all",
                goals.includes(g.id)
                  ? "border-brand bg-brand-light"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <span className={cn("shrink-0", goals.includes(g.id) ? "text-brand" : "text-slate-400")}>
                {g.icon}
              </span>
              <span className={cn("text-xs font-semibold", goals.includes(g.id) ? "text-brand" : "text-slate-700")}>
                {g.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2.5">
        <button type="button" onClick={onBack} className="ui-btn ui-btn-secondary ui-btn-lg gap-1.5">
          <ArrowLeft size={15} weight="bold" /> Voltar
        </button>
        <button
          type="button"
          disabled={!canSubmit || loading}
          onClick={onSubmit}
          className="ui-btn ui-btn-primary ui-btn-lg flex-1"
        >
          {loading ? (
            <div className="ui-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          ) : (
            <>Criar conta <ArrowRight size={16} weight="bold" /></>
          )}
        </button>
      </div>
    </>
  );
}
