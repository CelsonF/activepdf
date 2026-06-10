"use client";
import { useState, useEffect, useRef } from "react";
import {
  User,
  LockSimple,
  Bell,
  GraduationCap,
  ShieldCheck,
  Camera,
  CheckCircle,
  Building,
} from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

type Tab = "profile" | "organization" | "account" | "notifications" | "learning" | "privacy";

const BASE_TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: "profile", icon: <User size={16} weight="bold" />, label: "Perfil" },
  { id: "account", icon: <LockSimple size={16} weight="bold" />, label: "Conta" },
  { id: "notifications", icon: <Bell size={16} weight="bold" />, label: "Notificações" },
  { id: "learning", icon: <GraduationCap size={16} weight="bold" />, label: "Aprendizado" },
  { id: "privacy", icon: <ShieldCheck size={16} weight="bold" />, label: "Privacidade" },
];

const ORG_TAB = { id: "organization" as Tab, icon: <Building size={16} weight="bold" />, label: "Organização" };

type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0",
        on ? "bg-brand" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
          on && "translate-x-4"
        )}
      />
    </button>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function NotifRow({ label, desc, on, onChange }: { label: string; desc?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

interface OrgData {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const [isTeacher, setIsTeacher] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Profile
  const [displayName, setDisplayName] = useState("Ana Souza");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");

  // Account
  const [email] = useState("ana.souza@email.com");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  // Notifications
  const [notif, setNotif] = useState({ streak: true, weekly: true, ranking: true, product: false, email: true });

  // Learning
  const [level, setLevel] = useState<Level>("B1");
  const [dailyGoal, setDailyGoal] = useState(20);

  // Privacy
  const [privacy, setPrivacy] = useState({ publicProfile: true, showRanking: true, shareProgress: false });

  // Organization
  const [org, setOrg] = useState<OrgData | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgLogoB64, setOrgLogoB64] = useState<string | null>(null);
  const [orgLogoPreview, setOrgLogoPreview] = useState<string | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);

  const [saved, setSaved] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);

  useEffect(() => {
    // Detect role from session cookie heuristic — try fetching org
    fetch("/api/organization")
      .then((r) => {
        if (r.ok) {
          setIsTeacher(true);
          return r.json();
        }
        return null;
      })
      .then((data: OrgData | null) => {
        if (data) {
          setOrg(data);
          setOrgName(data.name);
          if (data.logoUrl) setOrgLogoPreview(data.logoUrl);
        }
      })
      .catch(() => undefined);
  }, []);

  const TABS = isTeacher
    ? [BASE_TABS[0], ORG_TAB, ...BASE_TABS.slice(1)]
    : BASE_TABS;

  function handleLogoFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOrgLogoB64(result);
      setOrgLogoPreview(result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveOrg() {
    if (!orgName.trim()) return;
    setOrgLoading(true);
    try {
      const body: Record<string, unknown> = { name: orgName.trim() };
      if (orgLogoB64) body.logoBase64 = orgLogoB64;

      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated: OrgData = await res.json();
        setOrg(updated);
        setOrgLogoB64(null);
        setOrgSaved(true);
        setTimeout(() => setOrgSaved(false), 2500);
      }
    } finally {
      setOrgLoading(false);
    }
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const backendBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeUp">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Conta</p>
          <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        </div>

        <div className="flex gap-6 lg:gap-8 flex-col lg:flex-row">
          {/* ── Sidebar tabs ─── */}
          <aside className="lg:w-44 shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn("ui-menu-item shrink-0")}
                  data-active={tab === t.id ? "true" : "false"}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Content ─────── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">

              {/* ── ORGANIZATION ─── */}
              {tab === "organization" && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 mb-0.5">Organização</h2>
                    <p className="text-sm text-slate-500">Nome e logo exibidos para seus alunos.</p>
                  </div>

                  {/* Logo picker */}
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div
                        className="w-20 h-20 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand transition-colors"
                        onClick={() => fileRef.current?.click()}
                      >
                        {orgLogoPreview ? (
                          <img
                            src={orgLogoPreview.startsWith("data:") ? orgLogoPreview : `${backendBase}${orgLogoPreview}`}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building size={28} className="text-slate-300" weight="bold" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center shadow-sm hover:bg-brand-dark"
                      >
                        <Camera size={13} weight="bold" />
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoFile(file);
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{org?.name ?? "Sua escola"}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Clique no ícone para mudar o logo</p>
                      {org?.slug && (
                        <p className="text-[11px] text-slate-300 mt-1 font-mono">/{org.slug}</p>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <FieldRow label="Nome da escola / organização" hint="Máximo 80 caracteres.">
                    <input
                      type="text"
                      className="ui-input py-2.5 text-sm"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Ex: Sarah's English Academy"
                      maxLength={80}
                    />
                  </FieldRow>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveOrg}
                      disabled={orgLoading || !orgName.trim()}
                      className="ui-btn ui-btn-primary ui-btn-md"
                    >
                      {orgLoading ? (
                        <div className="ui-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      ) : (
                        "Salvar organização"
                      )}
                    </button>
                    {orgSaved && (
                      <span className="flex items-center gap-1.5 text-sm text-emerald-600 animate-fadeUp">
                        <CheckCircle size={15} weight="fill" /> Salvo com sucesso
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* ── PROFILE ─── */}
              {tab === "profile" && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 mb-0.5">Perfil público</h2>
                    <p className="text-sm text-slate-500">Informações exibidas para outros usuários.</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar name={displayName} size={64} />
                      <button
                        type="button"
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shadow-sm"
                      >
                        <Camera size={12} weight="bold" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                      <p className="text-xs text-slate-400">Clique no ícone para mudar a foto</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <FieldRow label="Nome de exibição">
                    <input
                      type="text" className="ui-input py-2.5 text-sm"
                      value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Seu nome" maxLength={60}
                    />
                  </FieldRow>

                  <FieldRow label="Bio" hint="Máximo 160 caracteres.">
                    <textarea
                      className="ui-input py-2.5 text-sm resize-none"
                      rows={3} value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre você..." maxLength={160}
                    />
                  </FieldRow>

                  <FieldRow label="Fuso horário">
                    <select
                      className="ui-input py-2.5 text-sm"
                      value={timezone} onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      <option value="America/Manaus">Manaus (GMT-4)</option>
                      <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                    </select>
                  </FieldRow>
                </div>
              )}

              {/* ── ACCOUNT ─── */}
              {tab === "account" && (
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

                  <FieldRow label="Nova senha" hint="Mínimo 6 caracteres.">
                    <input
                      type="password" className="ui-input py-2.5 text-sm"
                      value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
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
              )}

              {/* ── NOTIFICATIONS ─── */}
              {tab === "notifications" && (
                <div className="flex flex-col gap-1">
                  <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-900 mb-0.5">Notificações</h2>
                    <p className="text-sm text-slate-500">Controle o que você recebe e quando.</p>
                  </div>

                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Push</p>
                  <NotifRow label="Lembrete de streak" desc="Avisa quando seu streak está em risco."
                    on={notif.streak} onChange={(v) => setNotif((n) => ({ ...n, streak: v }))} />
                  <NotifRow label="Resumo semanal" desc="Relatório de progresso toda segunda-feira."
                    on={notif.weekly} onChange={(v) => setNotif((n) => ({ ...n, weekly: v }))} />
                  <NotifRow label="Atualizações de ranking" desc="Quando alguém ultrapassar sua posição."
                    on={notif.ranking} onChange={(v) => setNotif((n) => ({ ...n, ranking: v }))} />
                  <NotifRow label="Novidades do produto"
                    on={notif.product} onChange={(v) => setNotif((n) => ({ ...n, product: v }))} />

                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-5 mb-2">E-mail</p>
                  <NotifRow label="Resumo por e-mail" desc="Receba um resumo semanal por e-mail."
                    on={notif.email} onChange={(v) => setNotif((n) => ({ ...n, email: v }))} />
                </div>
              )}

              {/* ── LEARNING ─── */}
              {tab === "learning" && (
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
                          onClick={() => setLevel(l)}
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
                      value={dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))}
                      className="w-full accent-brand"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>5 min</span><span>30 min</span><span>60 min</span><span>120 min</span>
                    </div>
                  </FieldRow>
                </div>
              )}

              {/* ── PRIVACY ─── */}
              {tab === "privacy" && (
                <div className="flex flex-col gap-1">
                  <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-900 mb-0.5">Privacidade</h2>
                    <p className="text-sm text-slate-500">Controle o que é visível para outros usuários.</p>
                  </div>
                  <NotifRow label="Perfil público" desc="Outros usuários podem ver seu perfil."
                    on={privacy.publicProfile} onChange={(v) => setPrivacy((p) => ({ ...p, publicProfile: v }))} />
                  <NotifRow label="Aparecer no ranking" desc="Seu nome aparece no placar semanal."
                    on={privacy.showRanking} onChange={(v) => setPrivacy((p) => ({ ...p, showRanking: v }))} />
                  <NotifRow label="Compartilhar progresso" desc="Professores podem ver seu progresso detalhado."
                    on={privacy.shareProgress} onChange={(v) => setPrivacy((p) => ({ ...p, shareProgress: v }))} />
                </div>
              )}

              {/* Save button — not on account or organization (has its own) */}
              {tab !== "account" && tab !== "organization" && (
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                  <button type="button" onClick={handleSave} className="ui-btn ui-btn-primary ui-btn-md">
                    Salvar alterações
                  </button>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 animate-fadeUp">
                      <CheckCircle size={15} weight="fill" /> Salvo com sucesso
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
