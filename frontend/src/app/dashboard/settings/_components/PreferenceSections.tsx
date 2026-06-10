"use client";
import { cn } from "@/lib/cn";
import { FieldRow, NotifRow } from "./controls";

export interface NotifPrefs {
  streak: boolean;
  weekly: boolean;
  ranking: boolean;
  product: boolean;
  email: boolean;
}

interface NotificationsSectionProps {
  notif: NotifPrefs;
  onChange: (patch: Partial<NotifPrefs>) => void;
}

export function NotificationsSection({ notif, onChange }: NotificationsSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 mb-0.5">Notificações</h2>
        <p className="text-sm text-slate-500">Controle o que você recebe e quando.</p>
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Push</p>
      <NotifRow label="Lembrete de streak" desc="Avisa quando seu streak está em risco."
        on={notif.streak} onChange={(v) => onChange({ streak: v })} />
      <NotifRow label="Resumo semanal" desc="Relatório de progresso toda segunda-feira."
        on={notif.weekly} onChange={(v) => onChange({ weekly: v })} />
      <NotifRow label="Atualizações de ranking" desc="Quando alguém ultrapassar sua posição."
        on={notif.ranking} onChange={(v) => onChange({ ranking: v })} />
      <NotifRow label="Novidades do produto"
        on={notif.product} onChange={(v) => onChange({ product: v })} />

      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-5 mb-2">E-mail</p>
      <NotifRow label="Resumo por e-mail" desc="Receba um resumo semanal por e-mail."
        on={notif.email} onChange={(v) => onChange({ email: v })} />
    </div>
  );
}

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface LearningSectionProps {
  level: Level;
  onLevel: (l: Level) => void;
  dailyGoal: number;
  onDailyGoal: (v: number) => void;
}

export function LearningSection({ level, onLevel, dailyGoal, onDailyGoal }: LearningSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-0.5">Aprendizado</h2>
        <p className="text-sm text-slate-500">Nível, meta diária e preferências de prática.</p>
      </div>

      <FieldRow label="Nível atual de inglês">
        <div className="grid grid-cols-6 gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLevel(l)}
              className={cn(
                "py-2 rounded-lg border-2 text-center text-xs font-bold tabular-nums transition-all",
                level === l
                  ? "border-brand bg-brand-light text-brand"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </FieldRow>

      <FieldRow label={`Meta diária — ${dailyGoal} min`} hint="Minutos de estudo por dia.">
        <input
          type="range" min={5} max={120} step={5}
          value={dailyGoal} onChange={(e) => onDailyGoal(Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>5 min</span><span>30 min</span><span>60 min</span><span>120 min</span>
        </div>
      </FieldRow>
    </div>
  );
}

export interface PrivacyPrefs {
  publicProfile: boolean;
  showRanking: boolean;
  shareProgress: boolean;
}

interface PrivacySectionProps {
  privacy: PrivacyPrefs;
  onChange: (patch: Partial<PrivacyPrefs>) => void;
}

export function PrivacySection({ privacy, onChange }: PrivacySectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 mb-0.5">Privacidade</h2>
        <p className="text-sm text-slate-500">Controle o que é visível para outros usuários.</p>
      </div>
      <NotifRow label="Perfil público" desc="Outros usuários podem ver seu perfil."
        on={privacy.publicProfile} onChange={(v) => onChange({ publicProfile: v })} />
      <NotifRow label="Aparecer no ranking" desc="Seu nome aparece no placar semanal."
        on={privacy.showRanking} onChange={(v) => onChange({ showRanking: v })} />
      <NotifRow label="Compartilhar progresso" desc="Professores podem ver seu progresso detalhado."
        on={privacy.shareProgress} onChange={(v) => onChange({ shareProgress: v })} />
    </div>
  );
}
