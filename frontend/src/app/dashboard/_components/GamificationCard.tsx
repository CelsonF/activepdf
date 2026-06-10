import Link from "next/link";
import { Flame, Lightning, Star, Trophy } from "@phosphor-icons/react/dist/ssr";
import { LEVEL_THRESHOLDS, xpPct, type GamificationStats } from "./dashboard-shared";

interface GamificationCardProps {
  gamif: GamificationStats | null;
}

export function GamificationCard({ gamif }: GamificationCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={16} weight="fill" className="text-amber-400" />
        <h2 className="text-[13px] font-bold text-slate-700">Progresso</h2>
        {gamif && gamif.streak > 0 && (
          <span className="ml-auto flex items-center gap-1 text-[12px] font-bold text-amber-600">
            <Flame size={14} weight="fill" /> {gamif.streak}d
          </span>
        )}
      </div>

      {gamif ? (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-bold text-slate-600 flex items-center gap-1">
                <Lightning size={11} weight="fill" className="text-brand" />
                Nível {gamif.level}
              </span>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {gamif.xp.toLocaleString("pt-BR")} XP
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full"
                style={{ width: `${xpPct(gamif.level, gamif.xp)}%` }}
              />
            </div>
            {LEVEL_THRESHOLDS[gamif.level] != null && (
              <p className="text-[10px] text-slate-400 mt-1 text-right">
                {LEVEL_THRESHOLDS[gamif.level]!.toLocaleString("pt-BR")} XP para nível {gamif.level + 1}
              </p>
            )}
          </div>

          {gamif.achievements.length > 0 && (
            <div className="flex items-center gap-2 py-2 px-3 bg-amber-50 rounded-xl border border-amber-100 mb-3">
              <Star size={14} weight="fill" className="text-amber-400 shrink-0" />
              <p className="text-[12px] font-semibold text-amber-700">
                {gamif.achievements.length} conquista{gamif.achievements.length !== 1 ? "s" : ""} desbloqueada{gamif.achievements.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Link
              href="/dashboard/achievements"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-600 hover:border-brand hover:text-brand transition-colors"
            >
              <Star size={12} weight="bold" /> Conquistas
            </Link>
            <Link
              href="/dashboard/ranking"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-600 hover:border-brand hover:text-brand transition-colors"
            >
              <Trophy size={12} weight="bold" /> Ranking
            </Link>
          </div>
        </>
      ) : (
        <p className="text-[12px] text-slate-400">Complete exercícios para ganhar XP.</p>
      )}
    </div>
  );
}
