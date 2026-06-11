"use client";
import { Avatar } from "@/components/ui/Avatar";
import { FieldRow } from "./controls";

interface ProfileSectionProps {
  displayName: string;
  onDisplayName: (v: string) => void;
  bio: string;
  onBio: (v: string) => void;
  timezone: string;
  onTimezone: (v: string) => void;
  showBio: boolean;
}

export function ProfileSection({
  displayName, onDisplayName, bio, onBio, timezone, onTimezone, showBio,
}: ProfileSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-0.5">Perfil público</h2>
        <p className="text-sm text-slate-500">Informações exibidas para outros usuários.</p>
      </div>

      <div className="flex items-center gap-4">
        <Avatar name={displayName || "?"} size={64} />
        <div>
          <p className="text-sm font-semibold text-slate-800">{displayName}</p>
          <p className="text-xs text-slate-400">O avatar usa as iniciais do seu nome</p>
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <FieldRow label="Nome de exibição">
        <input
          type="text" className="ui-input py-2.5 text-sm"
          value={displayName} onChange={(e) => onDisplayName(e.target.value)}
          placeholder="Seu nome" maxLength={60}
        />
      </FieldRow>

      {showBio && (
        <FieldRow label="Bio" hint="Máximo 160 caracteres.">
          <textarea
            className="ui-input py-2.5 text-sm resize-none"
            rows={3} value={bio}
            onChange={(e) => onBio(e.target.value)}
            placeholder="Conte um pouco sobre você..." maxLength={160}
          />
        </FieldRow>
      )}

      <FieldRow label="Fuso horário" hint="Salvo neste dispositivo.">
        <select
          className="ui-input py-2.5 text-sm"
          value={timezone} onChange={(e) => onTimezone(e.target.value)}
        >
          <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
          <option value="America/Manaus">Manaus (GMT-4)</option>
          <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
          <option value="UTC">UTC (GMT+0)</option>
        </select>
      </FieldRow>
    </div>
  );
}
