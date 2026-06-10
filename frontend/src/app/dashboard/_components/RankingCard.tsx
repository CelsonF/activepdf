import Link from "next/link";
import { Trophy } from "@phosphor-icons/react/dist/ssr";
import { xpPct, type LeaderboardEntry } from "./dashboard-shared";

interface RankingCardProps {
  leaderboard: LeaderboardEntry[];
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base">🥇</span>;
  if (rank === 2) return <span className="text-base">🥈</span>;
  if (rank === 3) return <span className="text-base">🥉</span>;
  return <span className="text-[12px] font-bold text-slate-400 w-5 text-center">{rank}</span>;
}

export function RankingCard({ leaderboard }: RankingCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={16} weight="fill" className="text-amber-400" />
          <h2 className="text-[13px] font-bold text-slate-700">Ranking XP</h2>
        </div>
        {leaderboard.length > 0 && (
          <Link href="/dashboard/reports" className="text-[12px] text-brand font-semibold hover:underline">
            Relatórios
          </Link>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-[12px] text-slate-400 text-center py-2">
          Nenhum aluno cadastrado ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {leaderboard.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center gap-2">
              <span className="w-5 text-center shrink-0">
                <RankBadge rank={entry.rank} />
              </span>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/dashboard/students/${entry.id}`}
                  className="text-[12px] font-semibold text-slate-700 truncate hover:text-brand hover:underline block"
                >
                  {entry.name}
                </Link>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full"
                      style={{ width: `${xpPct(entry.level, entry.xp)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                    {entry.xp} XP
                  </span>
                </div>
              </div>
              <span className="ui-badge ui-badge-sm ui-badge-brand shrink-0 tabular-nums">
                Nv.{entry.level}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
