import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { Trophy, Lightning, Flame, Medal } from "@phosphor-icons/react/dist/ssr";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
}

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000];

function xpToNextLevel(level: number, xp: number) {
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const currThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  if (xp >= nextThreshold) return { progress: 100, needed: 0, next: nextThreshold };
  const progress = Math.round(((xp - currThreshold) / (nextThreshold - currThreshold)) * 100);
  return { progress, needed: nextThreshold - xp, next: nextThreshold };
}

function medalColor(rank: number) {
  if (rank === 1) return "text-amber-400";
  if (rank === 2) return "text-slate-400";
  if (rank === 3) return "text-amber-600";
  return "text-slate-300";
}

function podiumBg(rank: number) {
  if (rank === 1) return "bg-amber-50 border-amber-200";
  if (rank === 2) return "bg-slate-50 border-slate-200";
  if (rank === 3) return "bg-orange-50 border-orange-200";
  return "bg-white border-slate-200";
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default async function RankingPage() {
  const session = await getSession();
  if (!session || session.role !== "student") redirect("/dashboard");

  const board = await serverFetch<LeaderboardEntry[]>(
    "/api/gamification/leaderboard"
  );

  const me = board.find((e) => e.id === session.userId);
  const myLevelInfo = me ? xpToNextLevel(me.level, me.xp) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-[60px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
          <Trophy size={14} weight="bold" color="white" />
        </div>
        <h1 className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">
          Ranking
        </h1>
        <span className="text-xs text-slate-400 font-medium">
          {board.length} aluno{board.length !== 1 ? "s" : ""}
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeUp flex flex-col gap-6">
        {/* My stats card */}
        {me && myLevelInfo && (
          <div className="bg-white rounded-2xl border border-brand/20 shadow-[0_0_0_3px_rgba(79,70,229,0.06)] p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-brand font-bold text-[15px] shrink-0">
                {initials(me.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">
                  {me.name}{" "}
                  <span className="text-brand font-extrabold">
                    #{me.rank}
                  </span>
                </p>
                <p className="text-xs text-slate-400">Você</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-extrabold text-brand tabular-nums">
                  {me.xp.toLocaleString("pt-BR")}
                </p>
                <p className="text-[11px] text-slate-400">XP</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                <Lightning size={13} weight="fill" className="text-brand" />
                Nível {me.level}
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                <Flame size={13} weight="fill" className="text-amber-500" />
                {me.streak} dias
              </div>
              <span className="ml-auto text-[11px] text-slate-400 tabular-nums">
                {myLevelInfo.needed > 0
                  ? `${myLevelInfo.needed} XP para nível ${me.level + 1}`
                  : "Nível máximo!"}
              </span>
            </div>

            {/* XP progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all"
                style={{ width: `${myLevelInfo.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {board.length === 0 ? (
          <EmptyState
            className="py-16"
            icon={<Trophy size={32} />}
            title="Nenhum aluno no ranking ainda."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {board.map((entry) => {
              const isMe = entry.id === session.userId;
              const isTop3 = entry.rank <= 3;

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                    isMe
                      ? "border-brand/30 bg-brand-light ring-1 ring-brand/20"
                      : podiumBg(entry.rank)
                  )}
                >
                  {/* Rank */}
                  <div className="w-8 text-center shrink-0">
                    {isTop3 ? (
                      <Medal
                        size={20}
                        weight="fill"
                        className={medalColor(entry.rank)}
                      />
                    ) : (
                      <span className="text-[13px] font-bold text-slate-400 tabular-nums">
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[12px] shrink-0",
                      isMe
                        ? "bg-brand text-white"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {initials(entry.name)}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold truncate",
                        isMe ? "text-brand" : "text-slate-800"
                      )}
                    >
                      {entry.name}
                      {isMe && (
                        <span className="ml-1.5 text-[10px] font-bold bg-brand text-white rounded-full px-1.5 py-0.5">
                          Você
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                        <Lightning size={10} weight="fill" className="text-brand/60" />
                        Nível {entry.level}
                      </span>
                      {entry.streak > 0 && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                          <Flame size={10} weight="fill" className="text-amber-400" />
                          {entry.streak}d
                        </span>
                      )}
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "text-sm font-extrabold tabular-nums",
                        isMe ? "text-brand" : "text-slate-700"
                      )}
                    >
                      {entry.xp.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-[10px] text-slate-400">XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
