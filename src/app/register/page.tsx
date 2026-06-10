"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeSlash,
  GraduationCap,
  BookOpen,
  Buildings,
  Code,
  CheckCircle,
  ChatCircle,
  Briefcase,
  Exam,
  TextT,
  Headphones,
  Camera,
  Building,
} from "@phosphor-icons/react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

type Role = "teacher" | "student" | "company" | "dev";
type Goal = "conversation" | "business" | "tech" | "exam" | "grammar" | "listening";
type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

const ROLES = [
  { id: "teacher" as Role, icon: <GraduationCap size={22} weight="bold" />, name: "Professor(a)", desc: "Atribuir e acompanhar turmas" },
  { id: "student" as Role, icon: <BookOpen size={22} weight="bold" />, name: "Aluno / Autodidata", desc: "Aprender com meu material" },
  { id: "company" as Role, icon: <Buildings size={22} weight="bold" />, name: "Empresa / RH", desc: "Capacitar meu time" },
  { id: "dev" as Role, icon: <Code size={22} weight="bold" />, name: "Dev / Tech", desc: "Inglês técnico" },
];

const LEVELS: { id: Level; label: string }[] = [
  { id: "A1", label: "Iniciante" }, { id: "A2", label: "Básico" },
  { id: "B1", label: "Intermediário" }, { id: "B2", label: "Inter. alto" },
  { id: "C1", label: "Avançado" }, { id: "C2", label: "Proficiente" },
];

const GOALS = [
  { id: "conversation" as Goal, icon: <ChatCircle size={16} weight="bold" />, label: "Conversação" },
  { id: "business" as Goal, icon: <Briefcase size={16} weight="bold" />, label: "Inglês de negócios" },
  { id: "tech" as Goal, icon: <Code size={16} weight="bold" />, label: "Inglês técnico" },
  { id: "exam" as Goal, icon: <Exam size={16} weight="bold" />, label: "Provas (TOEFL/IELTS)" },
  { id: "grammar" as Goal, icon: <TextT size={16} weight="bold" />, label: "Gramática" },
  { id: "listening" as Goal, icon: <Headphones size={16} weight="bold" />, label: "Listening" },
];

function stepLabels(role: Role | null) {
  if (role === "teacher") return ["Conta", "Perfil", "Escola"];
  return ["Conta", "Perfil", "Objetivos"];
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 0 — account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");

  // Step 1 — role
  const [role, setRole] = useState<Role | null>(null);

  // Step 2 teacher — org
  const [orgName, setOrgName] = useState("");
  const [orgLogoB64, setOrgLogoB64] = useState<string | null>(null);
  const [orgLogoPreview, setOrgLogoPreview] = useState<string | null>(null);

  // Step 2 student — goals
  const [level, setLevel] = useState<Level>("B1");
  const [goals, setGoals] = useState<Goal[]>(["conversation"]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const LABELS = stepLabels(role);

  const toggleGoal = (id: Goal) =>
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  function handleLogoFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOrgLogoB64(result);
      setOrgLogoPreview(result);
    };
    reader.readAsDataURL(file);
  }

  const canNext0 = name.trim().length > 0 && email.includes("@") && password.length >= 6;
  const canNext1 = role !== null;
  const canSubmitTeacher = canNext0 && canNext1 && orgName.trim().length > 0;
  const canSubmitStudent = canNext0 && canNext1 && goals.length > 0;
  const canSubmit = role === "teacher" ? canSubmitTeacher : canSubmitStudent;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = { name, email, password, role };

      if (role === "teacher") {
        body.organizationName = orgName.trim();
        if (orgLogoB64) body.logoBase64 = orgLogoB64;
      } else {
        body.teacherEmail = teacherEmail || undefined;
        body.level = level;
        body.goals = goals;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao criar conta."); setStep(0); return; }

      // Se professor mandou logo, envia via PATCH /api/organization
      if (role === "teacher" && orgLogoB64) {
        await fetch("/api/organization", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: orgName.trim(), logoBase64: orgLogoB64 }),
        });
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fadeUp">
        <Link href="/landing" className="inline-flex justify-center mb-8 w-full">
          <Logo size={30} />
        </Link>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {LABELS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold transition-all",
                  i < step
                    ? "bg-brand text-white"
                    : i === step
                    ? "bg-brand text-white ring-4 ring-brand/20"
                    : "bg-slate-200 text-slate-500"
                )}
              >
                {i < step ? <CheckCircle size={13} weight="fill" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  i === step ? "text-slate-800" : "text-slate-400"
                )}
              >
                {label}
              </span>
              {i < LABELS.length - 1 && (
                <div className={cn("w-8 h-px ml-1", i < step ? "bg-brand" : "bg-slate-200")} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] p-8">

          {error && (
            <div className="mb-5 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Step 0 — Conta ─────────────────────── */}
          {step === 0 && (
            <>
              <h1 className="text-xl font-bold text-slate-900 mb-1">Criar conta</h1>
              <p className="text-sm text-slate-500 mb-6">Começa em menos de 1 minuto.</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nome completo</label>
                  <input
                    type="text" className="ui-input py-2.5 text-sm"
                    placeholder="Seu nome" value={name}
                    onChange={(e) => setName(e.target.value)} maxLength={60}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">E-mail</label>
                  <input
                    type="email" className="ui-input py-2.5 text-sm"
                    placeholder="voce@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Senha <span className="text-slate-400 font-normal">(mín. 6 caracteres)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="ui-input pr-10 py-2.5 text-sm"
                      placeholder="Crie uma senha" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6} autoComplete="new-password"
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
                disabled={!canNext0}
                onClick={() => setStep(1)}
                className="ui-btn ui-btn-primary ui-btn-lg w-full mt-6"
              >
                Próximo <ArrowRight size={16} weight="bold" />
              </button>
            </>
          )}

          {/* ── Step 1 — Perfil ────────────────────── */}
          {step === 1 && (
            <>
              <h1 className="text-xl font-bold text-slate-900 mb-1">Qual é o seu perfil?</h1>
              <p className="text-sm text-slate-500 mb-6">Personalizamos a experiência para você.</p>

              <div className="grid grid-cols-2 gap-2.5 mb-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    E-mail do professor <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="email" className="ui-input py-2.5 text-sm"
                    placeholder="professor@email.com" value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Informe para ser vinculado automaticamente.
                  </p>
                </div>
              )}

              <div className="flex gap-2.5 mt-6">
                <button type="button" onClick={() => setStep(0)} className="ui-btn ui-btn-secondary ui-btn-lg gap-1.5">
                  <ArrowLeft size={15} weight="bold" /> Voltar
                </button>
                <button
                  type="button"
                  disabled={!canNext1}
                  onClick={() => setStep(2)}
                  className="ui-btn ui-btn-primary ui-btn-lg flex-1"
                >
                  Próximo <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </>
          )}

          {/* ── Step 2 teacher — Escola ────────────── */}
          {step === 2 && role === "teacher" && (
            <>
              <h1 className="text-xl font-bold text-slate-900 mb-1">Sua escola</h1>
              <p className="text-sm text-slate-500 mb-6">
                Configure o perfil da sua organização. Os alunos verão este nome e logo.
              </p>

              {/* Logo picker */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative shrink-0">
                  <div
                    className="w-16 h-16 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    {orgLogoPreview ? (
                      <img src={orgLogoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building size={24} className="text-slate-300" weight="bold" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shadow-sm hover:bg-brand-dark"
                  >
                    <Camera size={11} weight="bold" />
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
                  <p className="text-sm font-semibold text-slate-800">Logo da escola</p>
                  <p className="text-xs text-slate-400 mt-0.5">Clique para fazer upload (opcional)</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nome da escola / organização <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    className="ui-input py-2.5 text-sm"
                    placeholder={`${name.trim() || "Sarah"}'s English Academy`}
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    maxLength={80}
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Aparecerá no painel dos seus alunos.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 mt-6">
                <button type="button" onClick={() => setStep(1)} className="ui-btn ui-btn-secondary ui-btn-lg gap-1.5">
                  <ArrowLeft size={15} weight="bold" /> Voltar
                </button>
                <button
                  type="button"
                  disabled={!canSubmit || loading}
                  onClick={handleSubmit}
                  className="ui-btn ui-btn-primary ui-btn-lg flex-1"
                >
                  {loading ? (
                    <div className="ui-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  ) : (
                    <>Criar escola <ArrowRight size={16} weight="bold" /></>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ── Step 2 student — Objetivos ─────────── */}
          {step === 2 && role !== "teacher" && (
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
                      onClick={() => setLevel(l.id)}
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
                      onClick={() => toggleGoal(g.id)}
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
                <button type="button" onClick={() => setStep(1)} className="ui-btn ui-btn-secondary ui-btn-lg gap-1.5">
                  <ArrowLeft size={15} weight="bold" /> Voltar
                </button>
                <button
                  type="button"
                  disabled={!canSubmit || loading}
                  onClick={handleSubmit}
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
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
