"use client";
import { FieldRow } from "./controls";

interface AccountSectionProps {
  email: string;
  currentPwd: string;
  onCurrentPwd: (v: string) => void;
  newPwd: string;
  onNewPwd: (v: string) => void;
}

export function AccountSection({
  email, currentPwd, onCurrentPwd, newPwd, onNewPwd,
}: AccountSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-0.5">Conta</h2>
        <p className="text-sm text-slate-500">Credenciais e segurança.</p>
      </div>

      <FieldRow label="E-mail">
        <input type="email" className="ui-input py-2.5 text-sm" value={email} disabled />
      </FieldRow>

      <div className="h-px bg-slate-100" />
      <p className="text-sm font-semibold text-slate-700">Alterar senha</p>

      <FieldRow label="Senha atual">
        <input
          type="password" className="ui-input py-2.5 text-sm"
          value={currentPwd} onChange={(e) => onCurrentPwd(e.target.value)}
          placeholder="••••••••" autoComplete="current-password"
        />
      </FieldRow>

      <FieldRow label="Nova senha" hint="Mínimo 8 caracteres.">
        <input
          type="password" className="ui-input py-2.5 text-sm"
          value={newPwd} onChange={(e) => onNewPwd(e.target.value)}
          placeholder="••••••••" autoComplete="new-password"
        />
      </FieldRow>

      <div className="h-px bg-slate-100 mt-2" />

      <div>
        <p className="text-sm font-semibold text-red-600 mb-1">Zona de perigo</p>
        <p className="text-xs text-slate-400 mb-3">
          Esta ação é irreversível e excluirá todos os seus dados permanentemente.
        </p>
        <button type="button" className="ui-btn ui-btn-danger ui-btn-sm">
          Excluir minha conta
        </button>
      </div>
    </div>
  );
}
