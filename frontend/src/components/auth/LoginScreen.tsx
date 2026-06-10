"use client";
import { useState } from "react";
import { GraduationCap, BookOpen, FilePdf, ArrowRight } from "@phosphor-icons/react";
import { useAuth } from "@/store/authStore";
import type { UserRole } from "@/types";

interface RoleCardProps {
  role: UserRole;
  selected: boolean;
  onSelect: () => void;
}

function RoleCard({ role, selected, onSelect }: RoleCardProps) {
  const isTeacher = role === "teacher";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 w-full cursor-pointer",
        "transition-all duration-200 text-left outline-none",
        selected
          ? "border-brand bg-brand-light shadow-[0_0_0_4px_rgba(79,70,229,0.12)]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
    >
      <div
        className={[
          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-200",
          selected ? "bg-brand" : "bg-slate-100",
        ].join(" ")}
      >
        {isTeacher ? (
          <GraduationCap size={28} weight="bold" color={selected ? "white" : "#64748b"} />
        ) : (
          <BookOpen size={28} weight="bold" color={selected ? "white" : "#64748b"} />
        )}
      </div>

      <div className="text-center">
        <p className={`font-bold text-[15px] ${selected ? "text-brand" : "text-slate-800"}`}>
          {isTeacher ? "Professor" : "Aluno"}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug">
          {isTeacher
            ? "Cria e exporta documentos com campos editáveis"
            : "Preenche e responde documentos"}
        </p>
      </div>

      <div
        className={[
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-200",
          selected ? "border-brand bg-brand" : "border-slate-300 bg-white",
        ].join(" ")}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

export function LoginScreen() {
  const login = useAuth((s) => s.login);
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("");

  const canSubmit = role !== null && name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    login(name.trim(), role!);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeUp">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-brand">
            <FilePdf size={20} weight="bold" color="white" />
          </div>
          <span className="font-extrabold text-[22px] text-slate-900 tracking-[-0.4px]">
            ActivePDF
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] p-8"
        >
          <h1 className="text-xl font-bold text-slate-900 text-center mb-1">
            Bem-vindo!
          </h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            Selecione seu perfil para continuar
          </p>

          {/* Role cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <RoleCard
              role="teacher"
              selected={role === "teacher"}
              onSelect={() => setRole("teacher")}
            />
            <RoleCard
              role="student"
              selected={role === "student"}
              onSelect={() => setRole("student")}
            />
          </div>

          {/* Name input */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Seu nome
            </label>
            <input
              type="text"
              className="ui-input text-sm py-2.5"
              placeholder="Digite seu nome..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              maxLength={60}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="ui-btn ui-btn-primary ui-btn-lg w-full"
          >
            Continuar
            <ArrowRight size={16} weight="bold" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-5">
          100% no navegador · Nenhum dado enviado
        </p>
      </div>
    </div>
  );
}
