"use client";
import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { FieldRow } from "./controls";

interface AccountSectionProps {
  email: string;
}

export function AccountSection({ email }: AccountSectionProps) {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleChangePassword() {
    setPwdError("");
    setPwdSaving(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwdError(data.error ?? "Erro ao alterar a senha.");
        return;
      }
      setCurrentPwd("");
      setNewPwd("");
      setPwdSaved(true);
      setTimeout(() => setPwdSaved(false), 2500);
    } catch {
      setPwdError("Erro de conexão. Tente novamente.");
    } finally {
      setPwdSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Excluir sua conta apaga TODOS os seus dados permanentemente. Continuar?")) return;
    if (!confirm("Tem certeza? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) return;
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } finally {
      setDeleting(false);
    }
  }

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
          value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)}
          placeholder="••••••••" autoComplete="current-password"
        />
      </FieldRow>

      <FieldRow label="Nova senha" hint="Mínimo 8 caracteres.">
        <input
          type="password" className="ui-input py-2.5 text-sm"
          value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
          placeholder="••••••••" autoComplete="new-password"
        />
      </FieldRow>

      {pwdError && <p className="text-xs text-red-600 font-medium">{pwdError}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleChangePassword}
          disabled={pwdSaving || !currentPwd || newPwd.length < 8}
          className="ui-btn ui-btn-primary ui-btn-md"
        >
          {pwdSaving ? "Alterando..." : "Alterar senha"}
        </button>
        {pwdSaved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 animate-fadeUp">
            <CheckCircle size={15} weight="fill" /> Senha alterada
          </span>
        )}
      </div>

      <div className="h-px bg-slate-100 mt-2" />

      <div>
        <p className="text-sm font-semibold text-red-600 mb-1">Zona de perigo</p>
        <p className="text-xs text-slate-400 mb-3">
          Esta ação é irreversível e excluirá todos os seus dados permanentemente.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="ui-btn ui-btn-danger ui-btn-sm"
        >
          {deleting ? "Excluindo..." : "Excluir minha conta"}
        </button>
      </div>
    </div>
  );
}
