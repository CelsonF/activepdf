import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import {
  Sparkle,
  Lightning,
  Flame,
  PencilLine,
  Chalkboard,
  SpeakerHigh,
  Lock,
  Star,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";

interface Achievement {
  key: string;
  label: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface Stats {
  xp: number;
  level: number;
  streak: number;
}

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000];

function xpProgress(level: number, xp: number) {
  const curr = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  if (xp >= next) return { pct: 100, needed: 0, next };
  const pct = Math.round(((xp - curr) / (next - curr)) * 100);
  return { pct, needed: next - xp, next };
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  first_exercise: <PencilLine size={20} weight="fill" />,
  first_lesson: <Chalkboard size={20} weight="fill" />,
  first_audio: <SpeakerHigh size={20} weight="fill" />,
  streak_3: <Flame size={20} weight="fill" />,
  streak_7: <Flame size={20} weight="fill" />,
  streak_30: <Flame size={20} weight="fill" />,
  xp_100: <Lightning size={20} weight="fill" />,
  xp_500: <Lightning size={20} weight="fill" />,
  xp_1000: <Star size={20} weight="fill" />,
};

const ACHIEVEMENT_COLORS: Record<string, string> = {
  first_exercise: "text-emerald-600 bg-emerald-50 border-emerald-200",
  first_lesson: "text-blue-600 bg-blue-50 border-blue-200",
  first_audio: "text-violet-600 bg-violet-50 border-violet-200",
  streak_3: "text-amber-600 bg-amber-50 border-amber-200",
  streak_7: "text-orange-600 bg-orange-50 border-orange-200",
  streak_30: "text-red-600 bg-red-50 border-red-200",
  xp_100: "text-brand bg-brand-light border-indigo-200",
  xp_500: "text-brand bg-brand-light border-indigo-200",
  xp_1000: "text-amber-500 bg-amber-50 border-amber-200",
};

export default async function AchievementsPage() {
  const session = await getSession();
  if (!session || session.role !== "student") redirect("/dashboard");

  const [achievements, statsData] = await Promise.all([
    serverFetch<Achievement[]>("/api/gamification/achievements"),
    serverFetch<Stats>("/api/gamification/stats"),
  ]);

  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);
  const prog = xpProgress(statsData.level, statsData.xp);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-[60px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
          <Sparkle size={14} weight="fill" color="white" />
        </div>
        <h1 className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">
          Conquistas
        </h1>
        <span className="text-xs text-slate-400 font-medium">
          {unlocked.length}/{achievements.length} desbloqueadas
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeUp flex flex-col gap-8">
        {/* XP + Level card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-6 mb-5">
            {/* Level badge */}
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-brand-light border-2 border-brand/30 shrink-0">
              <Lightning size={18} weight="fill" className="text-brand" />
              <p className="text-[10px] font-bold text-brand/70 leading-tight">
                Nível
              </p>
              <p className="text-lg font-extrabold text-brand leading-tight tabular-nums">
                {statsData.level}
              </p>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-bold text-slate-800">
                  {statsData.xp.toLocaleString("pt-BR")} XP
                </p>
                <p className="text-xs text-slate-400">
                  {prog.needed > 0
                    ? `${prog.needed} XP para nível ${statsData.level + 1}`
                    : "Nível máximo!"}
                </p>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all"
                  style={{ width: `${prog.pct}%` }}
                />
              </div>
            </div>

            {/* Streak */}
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <Flame size={20} weight="fill" className="text-amber-500" />
              <p className="text-xl font-extrabold text-amber-500 tabular-nums leading-none">
                {statsData.streak}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">dias</p>
            </div>
          </div>

          {/* Mini stats */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            {[
              { label: "Conquistas", value: unlocked.length },
              {
                label: "Faltam",
                value: locked.length,
              },
              {
                label: "Streak",
                value: `${statsData.streak}d`,
              },
            ].map((s) => (
              <div key={s.label} className="flex-1 text-center">
                <p className="text-base font-extrabold text-slate-800 tabular-nums">
                  {s.value}
                </p>
                <p className="text-[11px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Unlocked achievements */}
        {unlocked.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkle size={14} weight="fill" className="text-amber-500" />
              <h2 className="text-sm font-bold text-slate-700">
                Desbloqueadas
              </h2>
              <span className="ml-auto text-[11px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unlocked.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {unlocked.map((ach) => (
                <AchievementCard key={ach.key} ach={ach} unlocked />
              ))}
            </div>
          </section>
        )}

        {/* Locked achievements */}
        {locked.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lock size={14} weight="bold" className="text-slate-400" />
              <h2 className="text-sm font-bold text-slate-500">Bloqueadas</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {locked.map((ach) => (
                <AchievementCard key={ach.key} ach={ach} unlocked={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function AchievementCard({
  ach,
  unlocked,
}: {
  ach: Achievement;
  unlocked: boolean;
}) {
  const colorCls = unlocked
    ? (ACHIEVEMENT_COLORS[ach.key] ?? "text-brand bg-brand-light border-indigo-200")
    : "text-slate-300 bg-slate-50 border-slate-200";

  const icon = ACHIEVEMENT_ICONS[ach.key] ?? <Sparkle size={20} weight="fill" />;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex flex-col items-center gap-2 text-center transition-all",
        unlocked
          ? "shadow-sm hover:shadow"
          : "opacity-60",
        colorCls
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorCls)}>
        {unlocked ? icon : <Lock size={18} />}
      </div>
      <p
        className={cn(
          "text-xs font-semibold leading-snug",
          unlocked ? "text-slate-800" : "text-slate-400"
        )}
      >
        {ach.label}
      </p>
      {ach.unlockedAt && (
        <p className="text-[10px] text-slate-400">{fmtDate(ach.unlockedAt)}</p>
      )}
    </div>
  );
}
