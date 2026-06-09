import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  MagnifyingGlass, Bell, Plus, ArrowRight, Lightning, PencilLine,
  Target, Clock, Flame, Trophy, Star, CalendarBlank, ChatCircle,
  Warning, Users, UploadSimple, UserPlus,
} from "@phosphor-icons/react/dist/ssr";
import { Avatar, ProgressRing } from "@/components/ui";
import { LogoutLink } from "./_components/SidebarNav";
import { cn } from "@/lib/cn";

// ── Mock data for gamification fields ───────────────────────────────────────
// Replace with real API calls once gamification backend is available.

const STUDENT_MOCK = {
  level: 7,
  levelName: "Explorador Intermediário",
  levelBadge: "B1",
  xp: 3940,
  xpNext: 5000,
  xpToNext: 1060,
  xpBar: 79,
  streak: 12,
  rank: 3,
  weekXp: 940,
  weekXpDelta: "+18%",
  exercisesDone: 127,
  exercisesDelta: "+12",
  precision: 86,
  precisionDelta: "+4%",
  weekTime: "6.4h",
  weekTimeDelta: "+1.2h",
  recentPdfs: [
    { id: "1", title: "Interchange 1 · Unit 3", level: "A2", done: 18, total: 24, gradient: "from-pink-500 to-purple-600" },
    { id: "2", title: "Business English · Meetings", level: "B1", done: 6, total: 20, gradient: "from-teal-400 to-cyan-500" },
    { id: "3", title: "Tech English for Devs", level: "B2", done: 11, total: 15, gradient: "from-emerald-500 to-green-600" },
  ],
  weekActivity: [
    { day: "S", h: 40 }, { day: "T", h: 65 }, { day: "Q", h: 22 },
    { day: "Q", h: 55 }, { day: "S", h: 38 }, { day: "S", h: 72 }, { day: "S", h: 45 },
  ],
  goalDays: 5,
  goalTarget: 7,
  goalPercent: 78,
  goalXpReward: 200,
  leaderboard: [
    { initials: "BT", name: "Bruno T.", xp: 4820, rank: 1 },
    { initials: "CM", name: "Carla M.", xp: 4310, rank: 2 },
    { initials: "AS", name: "Ana Souza", xp: 3940, rank: 3, isMe: true },
    { initials: "DR", name: "Diego R.", xp: 3500, rank: 4 },
    { initials: "ED", name: "Equipe Dev", xp: 3120, rank: 5 },
  ],
  achievementsDone: 3,
  achievementsTotal: 5,
};

const TEACHER_MOCK = {
  turmas: 4,
  studentsTotal: 96,
  corrections: 23,
  precisionAvg: 82,
  conclusionAvg: 61,
  classList: [
    { id: "1", name: "Interchange 1", level: "A2", students: 28, status: "Ativa", conclusion: 75, precision: 84, color: "bg-pink-500" },
    { id: "2", name: "Business English", level: "B1", students: 22, status: "Ativa", conclusion: 48, precision: 79, color: "bg-teal-500" },
    { id: "3", name: "Tech English", level: "B2", students: 19, status: "Concluída", conclusion: 91, precision: 88, color: "bg-emerald-500" },
    { id: "4", name: "Kids", level: "Starter", students: 27, status: "Ativa", conclusion: 33, precision: 72, color: "bg-orange-500" },
  ],
  weekActivity: [
    { day: "S", h: 30 }, { day: "T", h: 58 }, { day: "Q", h: 18 },
    { day: "Q", h: 70 }, { day: "S", h: 45 }, { day: "S", h: 80 }, { day: "S", h: 35 },
  ],
  attentionStudents: [
    { initials: "PA", name: "Pedro Alves", issue: "9 dias inativo", color: "bg-slate-400", issueColor: "text-slate-500" },
    { initials: "SC", name: "Sofia Castro", issue: "Precisão 54%", color: "bg-red-500", issueColor: "text-red-500" },
    { initials: "LP", name: "Lucas Pinto", issue: "3 tarefas vencidas", color: "bg-amber-500", issueColor: "text-amber-600" },
  ],
  topStudents: [
    { initials: "HL", name: "Helena Lopes", score: 96, rank: 1, color: "bg-violet-500" },
    { initials: "BT", name: "Bruno Tavares", score: 93, rank: 2, color: "bg-blue-500" },
    { initials: "MR", name: "Marina Reis", score: 90, rank: 3, color: "bg-emerald-500" },
    { initials: "TN", name: "Tiago Nunes", score: 88, rank: 4, color: "bg-indigo-500" },
    { initials: "AS", name: "Ana Souza", score: 86, rank: 5, color: "bg-pink-500" },
  ],
  deadlines: [
    { title: "Unidade 4 · Gramática", book: "Interchange 1", when: "Amanhã", urgent: true },
    { title: "Revisão Midterm", book: "Business English", when: "Sex, 13 jun", urgent: false },
  ],
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base">🥇</span>;
  if (rank === 2) return <span className="text-base">🥈</span>;
  if (rank === 3) return <span className="text-base">🥉</span>;
  return <span className="text-[12px] font-bold text-slate-400 w-5 text-center">{rank}</span>;
}

function ActivityBar({ bars, deltaLabel }: { bars: { day: string; h: number }[]; deltaLabel: string }) {
  const max = Math.max(...bars.map((b) => b.h));
  const lastIdx = bars.length - 1;
  return (
    <div>
      <div className="flex items-end gap-1.5 h-[72px]">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn("w-full rounded-t-md", i === lastIdx ? "bg-amber-400" : "bg-brand")}
              style={{ height: `${Math.round((b.h / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-slate-400">{b.day}</div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1">
        <ArrowRight size={11} className="text-emerald-500 rotate-[-45deg]" />
        <span className="text-[11px] text-emerald-600 font-semibold">{deltaLabel}</span>
      </div>
    </div>
  );
}

// ── Student Dashboard ────────────────────────────────────────────────────────

function StudentDashboard({ name }: { name: string }) {
  const m = STUDENT_MOCK;
  const firstName = name.split(" ")[0];

  return (
    <div className="p-6 animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Bem-vinda de volta</p>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Olá, {firstName} 👋</h1>
        </div>
        <Link href="/dashboard/exercises" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition-colors shadow-sm">
          <UploadSimple size={15} weight="bold" /> Nova prática
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_288px] gap-6">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-5">
          {/* Hero gamification card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#3730a3] to-[#4c1d95] p-5 text-white">
            <div className="flex items-center gap-5">
              {/* Level ring */}
              <div className="shrink-0">
                <ProgressRing size={80} value={m.xpBar} stroke={6} color="#a5b4fc" track="rgba(255,255,255,0.15)">
                  <div className="text-center">
                    <span className="text-lg font-bold text-white leading-none">{m.level}</span>
                    <span className="block text-[9px] text-indigo-300 font-bold uppercase tracking-wide leading-none mt-0.5">Nível</span>
                  </div>
                </ProgressRing>
              </div>
              {/* Level info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[15px] font-bold text-white">{m.levelName}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-bold text-indigo-200">{m.levelBadge}</span>
                </div>
                <p className="text-[12px] text-indigo-300 mb-2">{m.xp.toLocaleString("pt-BR")} XP</p>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 rounded-full bg-white/15">
                    <div className="h-2 rounded-full bg-amber-400" style={{ width: `${m.xpBar}%` }} />
                  </div>
                  <span className="text-[11px] text-indigo-300 whitespace-nowrap">{m.xpToNext.toLocaleString("pt-BR")} XP para o nível {m.level + 1}</span>
                </div>
              </div>
              {/* Right stats */}
              <div className="hidden sm:flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2">
                  <Flame size={14} weight="fill" className="text-amber-400" />
                  <div>
                    <p className="text-[16px] font-bold text-white leading-none">{m.streak}</p>
                    <p className="text-[10px] text-indigo-300 leading-none">dias seguidos</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2">
                  <Trophy size={14} weight="fill" className="text-amber-400" />
                  <div>
                    <p className="text-[16px] font-bold text-white leading-none">#{m.rank}</p>
                    <p className="text-[10px] text-indigo-300 leading-none">no ranking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Lightning size={16} weight="bold" className="text-amber-500" />, bg: "bg-amber-50", value: m.weekXp, label: "XP nesta semana", delta: m.weekXpDelta, deltaColor: "text-emerald-600" },
              { icon: <PencilLine size={16} weight="bold" className="text-indigo-500" />, bg: "bg-indigo-50", value: m.exercisesDone, label: "Exercícios feitos", delta: m.exercisesDelta, deltaColor: "text-emerald-600" },
              { icon: <Target size={16} weight="bold" className="text-emerald-500" />, bg: "bg-emerald-50", value: `${m.precision}%`, label: "Precisão", delta: m.precisionDelta, deltaColor: "text-emerald-600" },
              { icon: <Clock size={16} weight="bold" className="text-amber-500" />, bg: "bg-amber-50", value: m.weekTime, label: "Tempo na semana", delta: m.weekTimeDelta, deltaColor: "text-emerald-600" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", s.bg)}>{s.icon}</div>
                  <span className={cn("text-[11px] font-semibold", s.deltaColor)}>{s.delta}</span>
                </div>
                <p className="text-[22px] font-bold text-slate-900 leading-none tabular-nums">{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Continue PDFs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-bold text-slate-700">Continuar de onde parou</h2>
              <Link href="/dashboard/pdfs" className="text-[12px] text-brand font-semibold hover:underline flex items-center gap-1">
                Todos os PDFs <ArrowRight size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {m.recentPdfs.map((pdf) => {
                const pct = Math.round((pdf.done / pdf.total) * 100);
                return (
                  <Link key={pdf.id} href={`/dashboard/exercises/${pdf.id}`} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-brand hover:shadow-sm transition-all duration-150 group">
                    {/* Gradient thumbnail */}
                    <div className={cn("h-[88px] bg-gradient-to-br flex items-end justify-between p-3", pdf.gradient)}>
                      <span className="text-[10px] font-bold bg-black/30 text-white rounded-md px-1.5 py-0.5">{pdf.level}</span>
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Star size={16} weight="bold" className="text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[12.5px] font-semibold text-slate-800 leading-snug mb-2 group-hover:text-brand transition-colors">{pdf.title}</p>
                      <div className="h-1.5 rounded-full bg-slate-100 mb-1.5">
                        <div className="h-1.5 rounded-full bg-brand" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-400">✓ {pdf.done} / {pdf.total} exercícios</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Activity chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-slate-700">Atividade da semana</h2>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <ArrowRight size={11} className="rotate-[-45deg]" /> +18% XP
              </span>
            </div>
            <ActivityBar bars={m.weekActivity} deltaLabel="+18% em relação à semana passada" />
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-5">
          {/* Meta semanal */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-[13px] font-bold text-slate-700 mb-4">Meta semanal</h2>
            <div className="flex items-center gap-4">
              <ProgressRing size={72} value={m.goalPercent} stroke={6} color="#4f46e5">
                <span className="text-[14px] font-bold text-slate-900">{m.goalPercent}%</span>
              </ProgressRing>
              <div>
                <p className="text-[14px] font-bold text-slate-800">{m.goalDays} de {m.goalTarget} dias</p>
                <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                  Mais {m.goalTarget - m.goalDays} dias para bater a meta e ganhar{" "}
                  <span className="font-bold text-brand">+{m.goalXpReward} XP</span>
                </p>
              </div>
            </div>
          </div>

          {/* Ranking */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-slate-700">Ranking</h2>
              <span className="text-[11px] text-slate-400 font-medium">Esta semana</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {m.leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-2 rounded-xl",
                    entry.isMe ? "bg-brand-light" : "hover:bg-slate-50"
                  )}
                >
                  <RankBadge rank={entry.rank} />
                  <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-brand">{entry.initials}</span>
                  </div>
                  <span className={cn("flex-1 text-[12.5px] font-medium truncate", entry.isMe ? "text-brand font-semibold" : "text-slate-700")}>
                    {entry.name}{entry.isMe && " · você"}
                  </span>
                  <span className="text-[12px] font-bold text-slate-700 tabular-nums">{entry.xp.toLocaleString("pt-BR")}</span>
                </div>
              ))}
            </div>
            <Link href="/dashboard/ranking" className="flex items-center justify-center gap-1 mt-3 text-[12px] text-brand font-semibold hover:underline">
              Ranking completo <ArrowRight size={11} />
            </Link>
          </div>

          {/* Conquistas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-slate-700">Conquistas</h2>
              <span className="text-[12px] font-bold text-slate-500">{m.achievementsDone} / {m.achievementsTotal}</span>
            </div>
            <div className="flex gap-2 mt-3">
              {Array.from({ length: m.achievementsTotal }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    i < m.achievementsDone ? "bg-amber-50 border border-amber-200" : "bg-slate-100"
                  )}
                >
                  <Star
                    size={18}
                    weight={i < m.achievementsDone ? "fill" : "regular"}
                    className={i < m.achievementsDone ? "text-amber-500" : "text-slate-300"}
                  />
                </div>
              ))}
            </div>
            <Link href="/dashboard/achievements" className="flex items-center gap-1 mt-3 text-[12px] text-brand font-semibold hover:underline">
              Ver conquistas <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Teacher Dashboard ────────────────────────────────────────────────────────

function TeacherDashboard({ name }: { name: string }) {
  const m = TEACHER_MOCK;
  const firstName = name.split(" ")[0];

  return (
    <div className="p-6 animate-fadeUp">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Área do Professor</p>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Olá, prof. {firstName} 👋</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            {m.turmas} turmas · {m.studentsTotal} alunos · {m.corrections} para corrigir
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/dashboard/classes/new" className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:border-brand hover:text-brand transition-colors">
            <UserPlus size={14} weight="bold" /> Nova turma
          </Link>
          <Link href="/dashboard/corrections" className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition-colors shadow-sm">
            <UploadSimple size={14} weight="bold" /> Atribuir PDF
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_288px] gap-6">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Users size={16} weight="bold" className="text-violet-500" />, bg: "bg-violet-50", value: m.studentsTotal, label: "Alunos ativos", delta: "+8", deltaColor: "text-emerald-600" },
              { icon: <PencilLine size={16} weight="bold" className="text-amber-500" />, bg: "bg-amber-50", value: m.corrections, label: "Para corrigir", delta: "+5", deltaColor: "text-amber-600" },
              { icon: <Target size={16} weight="bold" className="text-emerald-500" />, bg: "bg-emerald-50", value: `${m.precisionAvg}%`, label: "Precisão média", delta: "+3%", deltaColor: "text-emerald-600" },
              { icon: <Star size={16} weight="bold" className="text-brand" />, bg: "bg-brand-light", value: `${m.conclusionAvg}%`, label: "Conclusão média", delta: "+6%", deltaColor: "text-emerald-600" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", s.bg)}>{s.icon}</div>
                  <span className={cn("text-[11px] font-semibold", s.deltaColor)}>{s.delta}</span>
                </div>
                <p className="text-[22px] font-bold text-slate-900 leading-none tabular-nums">{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Turmas grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-bold text-slate-700">Suas turmas</h2>
              <Link href="/dashboard/classes" className="text-[12px] text-brand font-semibold hover:underline flex items-center gap-1">
                Gerenciar turmas <ArrowRight size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {m.classList.map((cls) => (
                <Link key={cls.id} href={`/dashboard/classes/${cls.id}`} className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-brand hover:shadow-sm transition-all duration-150 group">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0", cls.color)}>
                        <Star size={18} weight="bold" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-800 group-hover:text-brand transition-colors leading-snug">{cls.name} · {cls.level}</p>
                        <p className="text-[11px] text-slate-400">{cls.students} alunos</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                      cls.status === "Ativa" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                    )}>
                      {cls.status === "Ativa" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 mb-px" />}
                      {cls.status}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] text-slate-500">Conclusão</span>
                        <span className="text-[11px] font-semibold text-slate-700">{cls.conclusion}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-brand" style={{ width: `${cls.conclusion}%` }} />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[11px] text-slate-500">Precisão média</span>
                      <span className={cn(
                        "text-[11px] font-semibold",
                        cls.precision >= 80 ? "text-emerald-600" : cls.precision >= 65 ? "text-amber-600" : "text-red-500"
                      )}>{cls.precision}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-slate-700">Atividade das turmas</h2>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <ArrowRight size={11} className="rotate-[-45deg]" /> +14%
              </span>
            </div>
            <ActivityBar bars={m.weekActivity} deltaLabel="+14% em relação à semana passada" />
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-5">
          {/* Precisa de atenção */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-slate-700">Precisa de atenção</h2>
              <span className="text-[11px] font-bold bg-red-50 text-red-500 rounded-full px-2 py-0.5">{m.attentionStudents.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {m.attentionStudents.map((s) => (
                <div key={s.name} className="flex items-center gap-2.5 py-1.5">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white", s.color)}>
                    <span className="text-[10px] font-bold">{s.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-slate-800 truncate">{s.name}</p>
                    <p className={cn("text-[11px] leading-snug flex items-center gap-1", s.issueColor)}>
                      <Warning size={11} weight="bold" className="shrink-0" /> {s.issue}
                    </p>
                  </div>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:border-brand hover:text-brand transition-colors shrink-0">
                    <ChatCircle size={13} />
                  </button>
                </div>
              ))}
            </div>
            <Link href="/dashboard/students" className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-slate-100 text-[12px] text-brand font-semibold hover:underline">
              Ver todos os alunos <ArrowRight size={11} />
            </Link>
          </div>

          {/* Melhores alunos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-slate-700">Melhores alunos</h2>
              <span className="text-[11px] text-slate-400 font-medium">Esta semana</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {m.topStudents.map((s) => (
                <div key={s.rank} className="flex items-center gap-2.5 px-1 py-2">
                  <RankBadge rank={s.rank} />
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white", s.color)}>
                    <span className="text-[10px] font-bold">{s.initials}</span>
                  </div>
                  <span className="flex-1 text-[12.5px] font-medium text-slate-700 truncate">{s.name}</span>
                  <span className="text-[12px] font-bold text-slate-700 tabular-nums">{s.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Próximos prazos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-slate-700">Próximos prazos</h2>
              <CalendarBlank size={15} className="text-slate-400" />
            </div>
            <div className="flex flex-col gap-3">
              {m.deadlines.map((d) => (
                <div key={d.title} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center shrink-0 mt-0.5">
                    <CalendarBlank size={14} weight="bold" className="text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold text-slate-800 leading-snug">{d.title}</p>
                    <p className="text-[11px] text-slate-400">{d.book}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0",
                    d.urgent ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                  )}>{d.when}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────

function Topbar({ name, role, initials }: { name: string; role: string; initials: string }) {
  return (
    <header className="h-[64px] bg-white/90 backdrop-blur border-b border-slate-200 flex items-center gap-3 px-6 sticky top-0 z-20">
      {/* Search */}
      <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 max-w-[280px] flex-1">
        <MagnifyingGlass size={14} className="text-slate-400 shrink-0" />
        <input
          readOnly
          placeholder="Buscar PDFs, exercícios..."
          className="bg-transparent outline-none text-[13px] text-slate-500 placeholder:text-slate-400 w-full cursor-default"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Role toggle for teacher */}
        {role === "teacher" && (
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-500 hover:bg-white hover:text-slate-800 transition-colors">Aluno</button>
            <button className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-white text-slate-800 shadow-sm">Professor</button>
          </div>
        )}
        {/* Lang toggle */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white text-slate-800 shadow-sm">PT</button>
          <button className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-700">EN</button>
        </div>
        {/* Bell */}
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell size={17} weight="bold" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand" />
        </button>
        {/* Avatar */}
        <Avatar name={initials} size={34} />
      </div>
    </header>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <Topbar name={session.name ?? "User"} role={session.role} initials={session.name ?? "U"} />
      {session.role === "teacher"
        ? <TeacherDashboard name={session.name ?? "Professor"} />
        : <StudentDashboard name={session.name ?? "Aluno"} />}
    </>
  );
}
