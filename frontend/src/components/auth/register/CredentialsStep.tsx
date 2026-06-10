"use client";
import { useState } from "react";
import { ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";

interface CredentialsStepProps {
  name: string;
  email: string;
  password: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  canNext: boolean;
  onNext: () => void;
}

export function CredentialsStep({
  name, email, password, onName, onEmail, onPassword, canNext, onNext,
}: CredentialsStepProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Criar conta</h1>
      <p className="text-sm text-slate-500 mb-6">Começa em menos de 1 minuto.</p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nome completo</label>
          <input
            type="text" className="ui-input py-2.5 text-sm"
            placeholder="Seu nome" value={name}
            onChange={(e) => onName(e.target.value)} maxLength={60}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">E-mail</label>
          <input
            type="email" className="ui-input py-2.5 text-sm"
            placeholder="voce@email.com" value={email}
            onChange={(e) => onEmail(e.target.value)} autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Senha <span className="text-slate-400 font-normal">(mín. 8 caracteres)</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="ui-input pr-10 py-2.5 text-sm"
              placeholder="Crie uma senha" value={password}
              onChange={(e) => onPassword(e.target.value)}
              minLength={8} autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!canNext}
        onClick={onNext}
        className="ui-btn ui-btn-primary ui-btn-lg w-full mt-6"
      >
        Próximo <ArrowRight size={16} weight="bold" />
      </button>
    </>
  );
}
