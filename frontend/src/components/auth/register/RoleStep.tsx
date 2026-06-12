"use client";
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { ROLES, type Role } from "./register-data";

interface RoleStepProps {
  role: Role | null;
  onRole: (r: Role) => void;
  teacherEmail: string;
  onTeacherEmail: (v: string) => void;
  isAutodidact: boolean;
  onIsAutodidact: (v: boolean) => void;
  canNext: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function RoleStep({
  role, onRole, teacherEmail, onTeacherEmail, isAutodidact, onIsAutodidact, canNext, onBack, onNext,
}: RoleStepProps) {
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Qual é o seu perfil?</h1>
      <p className="text-sm text-slate-500 mb-6">Personalizamos a experiência para você.</p>

      <div className="grid grid-cols-2 gap-2.5 mb-2">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onRole(r.id)}
            className={cn(
              "flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 cursor-pointer transition-all duration-150 outline-none text-center",
              role === r.id
                ? "border-brand bg-brand-light"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <span className={cn("transition-colors", role === r.id ? "text-brand" : "text-slate-400")}>
              {r.icon}
            </span>
            <span className={cn("text-xs font-semibold leading-snug", role === r.id ? "text-brand" : "text-slate-700")}>
              {r.name}
            </span>
            <span className="text-[11px] text-slate-400 leading-tight">{r.desc}</span>
          </button>
        ))}
      </div>

      {role === "student" && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onIsAutodidact(!isAutodidact)}
            className={cn(
              "flex items-start gap-2.5 w-full px-3 py-2.5 rounded-xl border-2 text-left transition-all",
              isAutodidact
                ? "border-brand bg-brand-light"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                isAutodidact ? "border-brand bg-brand" : "border-slate-300 bg-white"
              )}
            >
              {isAutodidact && <Check size={10} weight="bold" color="white" />}
            </span>
            <span>
              <span className={cn("block text-xs font-semibold", isAutodidact ? "text-brand" : "text-slate-700")}>
                Não preciso de professor — sou autodidata
              </span>
              <span className="block text-[11px] text-slate-400 leading-snug mt-0.5">
                Você cria seus próprios exercícios com campos para preencher. Depois,
                só um professor pode mudar seu perfil para aluno regular.
              </span>
            </span>
          </button>

          {!isAutodidact && (
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                E-mail do professor <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                type="email" className="ui-input py-2.5 text-sm"
                placeholder="professor@email.com" value={teacherEmail}
                onChange={(e) => onTeacherEmail(e.target.value)}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Informe para ser vinculado automaticamente.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2.5 mt-6">
        <button type="button" onClick={onBack} className="ui-btn ui-btn-secondary ui-btn-lg gap-1.5">
          <ArrowLeft size={15} weight="bold" /> Voltar
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className="ui-btn ui-btn-primary ui-btn-lg flex-1"
        >
          Próximo <ArrowRight size={16} weight="bold" />
        </button>
      </div>
    </>
  );
}
