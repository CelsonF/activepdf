import Link from "next/link";
import {
  Upload,
  PencilSimple,
  Trophy,
  ChartBar,
  GraduationCap,
  UsersThree,
  Buildings,
  Code,
  ArrowRight,
  CheckCircle,
  FilePdf,
  Flame,
  Medal,
} from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/ui";

const FEATURES = [
  {
    icon: <Upload size={22} weight="bold" />,
    title: "Carregue qualquer PDF",
    desc: "Apostilas, exercícios, artigos — transforme o material que você já usa em prática interativa.",
  },
  {
    icon: <PencilSimple size={22} weight="bold" />,
    title: "Exercícios interativos",
    desc: "Campos, múltipla escolha e áudio sobre a própria página. Responda no contexto real.",
  },
  {
    icon: <Trophy size={22} weight="bold" />,
    title: "Gamificação integrada",
    desc: "XP, níveis, streaks e conquistas trazem o aluno de volta todo dia.",
  },
  {
    icon: <ChartBar size={22} weight="bold" />,
    title: "Progresso visível",
    desc: "Pontuações, metas semanais e rankings — para o aluno e para o professor.",
  },
];

const AUDIENCES = [
  {
    icon: <GraduationCap size={21} weight="bold" />,
    title: "Alunos e autodidatas",
    desc: "Pratique com material real e acompanhe cada passo do aprendizado.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: <UsersThree size={21} weight="bold" />,
    title: "Professores",
    desc: "Atribua PDFs, corrija automaticamente e acompanhe a evolução de cada turma.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: <Buildings size={21} weight="bold" />,
    title: "Empresas",
    desc: "Capacite times em inglês de negócios com resultado medível e relatórios de progresso.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <Code size={21} weight="bold" />,
    title: "Devs e Tech",
    desc: "Inglês técnico para início de carreira, diretamente em documentação real.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const TRUST_BRANDS = ["LinguaLab", "CodeAcademy BR", "EduPrime", "TechFluent", "Nova Idiomas"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── NAV ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between gap-4">
          <Logo size={28} />

          <nav className="hidden md:flex items-center gap-6">
            {["Recursos", "Para professores", "Para empresas", "Preços"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="ui-btn ui-btn-ghost ui-btn-sm">
              Entrar
            </Link>
            <Link href="/register" className="ui-btn ui-btn-primary ui-btn-sm gap-1">
              Criar conta <ArrowRight size={13} weight="bold" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
        <div className="animate-fadeUp">
          <span className="inline-flex items-center gap-1.5 ui-badge ui-badge-brand ui-badge-sm mb-6">
            <FilePdf size={12} weight="bold" /> Aprendizado nativo em PDF
          </span>

          <h1 className="text-[44px] lg:text-[52px] font-bold text-slate-900 tracking-[-0.03em] leading-[1.06] mb-5">
            Transforme qualquer PDF em prática de inglês que{" "}
            <span className="text-brand">engaja.</span>
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed max-w-[480px] mb-8">
            Suba sua apostila, responda exercícios sobre a própria página e mantenha o ritmo com XP,
            streaks e rankings — para alunos, professores e times.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link href="/register" className="ui-btn ui-btn-primary ui-btn-lg gap-2">
              <Upload size={16} weight="bold" /> Começar grátis
            </Link>
            <Link href="/dashboard" className="ui-btn ui-btn-outline ui-btn-lg gap-2">
              Ver o dashboard <ArrowRight size={15} />
            </Link>
          </div>

          <div className="flex flex-wrap gap-5 text-xs text-slate-500">
            {["Sem cartão de crédito", "Bilíngue PT / EN", "Conforme a LGPD"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} weight="fill" className="text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Hero app mockup */}
        <div className="animate-slideIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_40px_rgba(0,0,0,0.1)] overflow-hidden rotate-[0.5deg]">
            {/* Faux browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-[11px] text-slate-400 font-mono">interchange-unit-3.pdf</span>
            </div>

            <div className="grid grid-cols-[1fr_140px]">
              {/* PDF side */}
              <div className="p-5 border-r border-slate-100">
                <div className="h-16 rounded-lg bg-slate-100 mb-4 flex items-center justify-center">
                  <FilePdf size={24} className="text-slate-300" />
                </div>
                <p className="text-xs font-semibold text-slate-700 mb-3">
                  Complete com o verbo correto:
                </p>
                {[
                  { q: "She ___ to work by train.", a: "goes", done: true },
                  { q: "They ___ English on Mondays.", a: "study", done: true },
                  { q: "I ___ a developer.", a: "", done: false },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] text-slate-500 flex-1">{row.q}</span>
                    <span
                      className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md min-w-[44px] text-center ${
                        row.done
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-white text-slate-300 border border-slate-200"
                      }`}
                    >
                      {row.a || "···"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Gamification panel */}
              <div className="p-4 bg-slate-50 flex flex-col gap-3 items-center">
                <div className="text-center">
                  <p className="text-xl font-bold text-brand tabular-nums">+45</p>
                  <p className="text-[10px] text-slate-400">XP nesta página</p>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-brand" />
                </div>
                <span className="flex items-center gap-1 ui-badge ui-badge-sm ui-badge-warning w-full justify-center">
                  <Flame size={11} weight="fill" /> 12 dias
                </span>
                <span className="flex items-center gap-1 ui-badge ui-badge-sm ui-badge-brand w-full justify-center">
                  <Medal size={11} weight="fill" /> Nível 7
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAND ──────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide">
            Usado por escolas e times
          </span>
          <div className="flex items-center gap-8 flex-wrap opacity-50">
            {TRUST_BRANDS.map((b) => (
              <span key={b} className="text-[14px] font-bold text-slate-600 tracking-tight">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand mb-3 block">
            Como funciona
          </span>
          <h2 className="text-4xl font-bold text-slate-900 tracking-[-0.02em]">
            Seu material. Ativado.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-brand hover:shadow-sm transition-all duration-150"
            >
              <span className="w-11 h-11 rounded-xl bg-brand-light text-brand flex items-center justify-center">
                {f.icon}
              </span>
              <p className="font-bold text-slate-800">{f.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AUDIENCES ───────────────────────────────────── */}
      <section className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between flex-wrap gap-5 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-3 block">
                Feito para
              </span>
              <h2 className="text-[34px] font-bold text-white tracking-[-0.02em]">
                Uma plataforma, quatro jornadas
              </h2>
            </div>
            <Link href="/register" className="ui-btn ui-btn-outline ui-btn-md gap-1.5 border-white/20 text-white hover:bg-white/10">
              Escolher meu perfil <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AUDIENCES.map((a) => (
              <div
                key={a.title}
                className="flex flex-col gap-4 p-6 rounded-2xl border border-white/10 bg-white/5"
              >
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.color} bg-opacity-20`}>
                  {a.icon}
                </span>
                <p className="font-semibold text-white text-[15px]">{a.title}</p>
                <p className="text-sm text-white/60 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-brand-light border border-indigo-200 px-10 py-14 text-center">
          <h2 className="text-[34px] font-bold text-slate-900 tracking-[-0.02em] mb-3">
            Pronto para ativar um PDF?
          </h2>
          <p className="text-slate-600 text-[16px] max-w-md mx-auto mb-8 leading-relaxed">
            Crie sua conta em menos de um minuto. Traga seu próprio material.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="ui-btn ui-btn-primary ui-btn-lg gap-2">
              <Upload size={16} weight="bold" /> Começar grátis
            </Link>
            <Link href="/login" className="ui-btn ui-btn-outline ui-btn-lg">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <Logo size={24} />
          <div className="flex items-center gap-6 text-sm text-slate-400 flex-wrap">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Termos</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Suporte</a>
            <span>© 2026 ActivePDF</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
