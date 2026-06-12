"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  EnvelopeSimple,
  LockSimple,
  ArrowRight,
  Eye,
  EyeSlash,
  CheckCircle,
  Upload,
  Trophy,
  ChartBar,
} from "@phosphor-icons/react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

const PERKS = [
  {
    icon: <Upload size={18} weight="bold" />,
    title: "Upload qualquer PDF",
    desc: "Apostilas, exercícios, artigos — transforme o material que você já usa em prática.",
  },
  {
    icon: <Trophy size={18} weight="bold" />,
    title: "Gamificação integrada",
    desc: "XP, níveis, streaks e conquistas trazem o aluno de volta todo dia.",
  },
  {
    icon: <ChartBar size={18} weight="bold" />,
    title: "Progresso visível",
    desc: "Pontuações, metas semanais e rankings — para o aluno e o professor.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao entrar."); return; }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left — form ─────────────────────────────────── */}
      <div className="flex flex-col justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[392px] mx-auto animate-fadeUp">
          <Link href="/" className="inline-flex mb-10">
            <Logo size={32} />
          </Link>

          <h1 className="text-[27px] font-bold text-slate-900 tracking-[-0.02em] mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Entre para manter sua sequência de estudos.
          </p>

          {error && (
            <div className="mb-5 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <EnvelopeSimple
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="email"
                  className="ui-input pl-9 py-2.5 text-sm"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Senha</label>
                <a href="#" className="text-xs text-brand hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <LockSimple
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  className="ui-input pl-9 pr-10 py-2.5 text-sm"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ui-btn ui-btn-primary ui-btn-lg w-full mt-2"
            >
              {loading ? (
                <div className="ui-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              ) : (
                <>Entrar <ArrowRight size={16} weight="bold" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Não tem conta?{" "}
            <Link href="/register" className="font-semibold text-brand hover:underline">
              Criar conta grátis
            </Link>
          </p>

          <div className="mt-5 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 text-center">
            <strong>Demo:</strong> sarah@activepdf.app / teacher123
            <br />
            joao@activepdf.app / student123
          </div>
        </div>
      </div>

      {/* ── Right — brand visual ─────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-center px-12 py-12 bg-brand relative overflow-hidden">
        {/* decorative circles */}
        <span className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/[0.06]" />
        <span className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-white/[0.06]" />

        <div className="relative z-10 max-w-md">
          <Logo size={36} mono />

          <h2 className="text-[32px] font-bold text-white tracking-[-0.02em] leading-tight mt-10 mb-4">
            Transforme qualquer PDF em prática de inglês que <span className="text-indigo-200">engaja.</span>
          </h2>
          <p className="text-indigo-200 text-[15px] leading-relaxed mb-10">
            Suba sua apostila, responda exercícios sobre a própria página e mantenha o ritmo com XP, streaks e rankings.
          </p>

          <div className="flex flex-col gap-5">
            {PERKS.map((p) => (
              <div key={p.title} className="flex items-start gap-4">
                <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-indigo-100">
                  {p.icon}
                </span>
                <div>
                  <p className="font-semibold text-white text-sm">{p.title}</p>
                  <p className="text-indigo-200 text-xs leading-snug mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/10">
            {[
              { v: "1 200+", l: "usuários ativos" },
              { v: "98 %", l: "de satisfação" },
              { v: "4.9 ★", l: "avaliação média" },
            ].map((s) => (
              <div key={s.l}>
                <p className={cn("text-xl font-bold text-white tabular-nums")}>{s.v}</p>
                <p className="text-indigo-300 text-xs">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
