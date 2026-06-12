"use client";
import { useState, useEffect } from "react";
import {
  User,
  LockSimple,
  Bell,
  GraduationCap,
  ShieldCheck,
  CheckCircle,
  Building,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useLocalPref } from "@/hooks/useLocalPref";
import { OrganizationSection, type OrgData } from "./_components/OrganizationSection";
import { ProfileSection } from "./_components/ProfileSection";
import { AccountSection } from "./_components/AccountSection";
import {
  LearningSection,
  NotificationsSection,
  PrivacySection,
  type Level,
  type NotifPrefs,
  type PrivacyPrefs,
} from "./_components/PreferenceSections";

type Tab = "profile" | "organization" | "account" | "notifications" | "learning" | "privacy";

const BASE_TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: "profile", icon: <User size={16} weight="bold" />, label: "Perfil" },
  { id: "account", icon: <LockSimple size={16} weight="bold" />, label: "Conta" },
  { id: "notifications", icon: <Bell size={16} weight="bold" />, label: "Notificações" },
  { id: "learning", icon: <GraduationCap size={16} weight="bold" />, label: "Aprendizado" },
  { id: "privacy", icon: <ShieldCheck size={16} weight="bold" />, label: "Privacidade" },
];

const ORG_TAB = { id: "organization" as Tab, icon: <Building size={16} weight="bold" />, label: "Organização" };

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const [isTeacher, setIsTeacher] = useState(false);

  // Profile (persistido no backend via /api/profile)
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Preferências locais (este dispositivo)
  const [timezone, setTimezone] = useLocalPref("prefs.timezone", "America/Sao_Paulo");
  const [notif, setNotif] = useLocalPref<NotifPrefs>("prefs.notifications", {
    streak: true, weekly: true, ranking: true, product: false, email: true,
  });
  const [level, setLevel] = useLocalPref<Level>("prefs.level", "B1");
  const [dailyGoal, setDailyGoal] = useLocalPref("prefs.dailyGoal", 20);
  const [privacy, setPrivacy] = useLocalPref<PrivacyPrefs>("prefs.privacy", {
    publicProfile: true, showRanking: true, shareProgress: false,
  });

  // Organization
  const [org, setOrg] = useState<OrgData | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgLogoB64, setOrgLogoB64] = useState<string | null>(null);
  const [orgLogoPreview, setOrgLogoPreview] = useState<string | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { name: string; email: string; bio: string | null; role: string } | null) => {
        if (!data) return;
        setDisplayName(data.name);
        setEmail(data.email);
        setBio(data.bio ?? "");
        setIsTeacher(data.role === "teacher");
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isTeacher) return;
    fetch("/api/organization")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: OrgData | null) => {
        if (data) {
          setOrg(data);
          setOrgName(data.name);
          if (data.logoUrl) setOrgLogoPreview(data.logoUrl);
        }
      })
      .catch(() => undefined);
  }, [isTeacher]);

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

  async function handleSaveProfile() {
    if (!displayName.trim()) return;
    setProfileSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName.trim(),
          ...(isTeacher ? { bio: bio.trim() || null } : {}),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setProfileSaving(false);
    }
  }

  const backendBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const isLocalPrefTab = tab === "notifications" || tab === "learning" || tab === "privacy";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeUp">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Conta</p>
          <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        </div>

        <div className="flex gap-6 lg:gap-8 flex-col lg:flex-row">
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

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
              {tab === "organization" && (
                <OrganizationSection
                  org={org} orgName={orgName} onOrgName={setOrgName}
                  logoPreview={orgLogoPreview} onLogoFile={handleLogoFile}
                  loading={orgLoading} saved={orgSaved} onSave={handleSaveOrg}
                  backendBase={backendBase}
                />
              )}

              {tab === "profile" && (
                <ProfileSection
                  displayName={displayName} onDisplayName={setDisplayName}
                  bio={bio} onBio={setBio}
                  timezone={timezone} onTimezone={setTimezone}
                  showBio={isTeacher}
                />
              )}

              {tab === "account" && <AccountSection email={email} />}

              {tab === "notifications" && (
                <NotificationsSection notif={notif} onChange={(patch) => setNotif({ ...notif, ...patch })} />
              )}

              {tab === "learning" && (
                <LearningSection level={level} onLevel={setLevel} dailyGoal={dailyGoal} onDailyGoal={setDailyGoal} />
              )}

              {tab === "privacy" && (
                <PrivacySection privacy={privacy} onChange={(patch) => setPrivacy({ ...privacy, ...patch })} />
              )}

              {tab === "profile" && (
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={profileSaving || !displayName.trim()}
                    className="ui-btn ui-btn-primary ui-btn-md"
                  >
                    {profileSaving ? "Salvando..." : "Salvar alterações"}
                  </button>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 animate-fadeUp">
                      <CheckCircle size={15} weight="fill" /> Salvo com sucesso
                    </span>
                  )}
                </div>
              )}

              {isLocalPrefTab && (
                <p className="mt-6 pt-5 border-t border-slate-100 text-[11px] text-slate-400">
                  Preferências salvas automaticamente neste dispositivo.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
