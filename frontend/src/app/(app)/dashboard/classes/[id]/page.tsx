import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import {
  Chalkboard,
  ArrowLeft,
  UsersThree,
  Lightning,
  Flame,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { RemoveStudentButton, AddStudentToClass } from "../_components";
import { cn } from "@/lib/cn";

interface ClassDetail {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  students: Array<{
    id: string;
    name: string;
    email: string;
    addedAt: string;
    learningPlan: { level: string } | null;
    userStats: { xp: number; level: number; streak: number } | null;
  }>;
}

interface StudentBasic {
  id: string;
  name: string;
  email: string;
}

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000];

function xpPct(level: number, xp: number) {
  const curr = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next =
    LEVEL_THRESHOLDS[level] ??
    LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  if (xp >= next) return 100;
  return Math.round(((xp - curr) / (next - curr)) * 100);
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ClassDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  let cls: ClassDetail;
  try {
    cls = await serverFetch<ClassDetail>(`/api/classes/${params.id}`);
  } catch {
    notFound();
  }

  const allStudents = await serverFetch<StudentBasic[]>("/api/students");
  const existingIds = cls.students.map((s) => s.id);

  // Sort by XP desc
  const sorted = [...cls.students].sort(
    (a, b) => (b.userStats?.xp ?? 0) - (a.userStats?.xp ?? 0)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-[60px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <Link
          href="/dashboard/classes"
          className="ui-btn ui-btn-secondary ui-btn-sm gap-1 shrink-0"
        >
          <ArrowLeft size={13} /> Turmas
        </Link>
        <div className="ui-divider" />
        <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Chalkboard size={12} weight="bold" className="text-blue-600" />
        </div>
        <p className="font-bold text-[14px] text-slate-900 truncate">
          {cls.name}
        </p>

        <div className="ml-auto">
          <AddStudentToClass
            classId={cls.id}
            existingIds={existingIds}
            allStudents={allStudents}
          />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeUp flex flex-col gap-6">
        {/* Class meta */}
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Chalkboard size={18} weight="fill" className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">{cls.name}</p>
              {cls.description && (
                <p className="text-xs text-slate-400">{cls.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-extrabold text-blue-600 tabular-nums">
                {cls.students.length}
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-0.5 justify-end">
                <UsersThree size={10} /> aluno{cls.students.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Criada em {fmtDate(cls.createdAt)}
          </p>
        </div>

        {/* Student list */}
        {sorted.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <UsersThree size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-3">
              Nenhum aluno nesta turma ainda.
            </p>
            <AddStudentToClass
              classId={cls.id}
              existingIds={existingIds}
              allStudents={allStudents}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((student, idx) => {
              const xp = student.userStats?.xp ?? 0;
              const level = student.userStats?.level ?? 1;
              const streak = student.userStats?.streak ?? 0;
              const pct = xpPct(level, xp);

              return (
                <div
                  key={student.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors px-4 py-3 flex items-center gap-3"
                >
                  {/* Rank */}
                  <span className="text-[13px] font-bold text-slate-300 w-5 text-center shrink-0 tabular-nums">
                    {idx + 1}
                  </span>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-[11px] shrink-0">
                    {initials(student.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {student.name}
                      </p>
                      {student.learningPlan && (
                        <span className="ui-badge ui-badge-sm ui-badge-brand shrink-0">
                          {student.learningPlan.level}
                        </span>
                      )}
                    </div>

                    {/* XP bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
                        <Lightning size={9} weight="fill" className="text-brand/60" />
                        Nv.{level}
                      </span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                        {xp} XP
                      </span>
                      {streak > 0 && (
                        <span className="text-[10px] text-amber-500 flex items-center gap-0.5 shrink-0">
                          <Flame size={9} weight="fill" /> {streak}d
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/dashboard/students/${student.id}`}
                      className="ui-btn ui-btn-ghost ui-btn-sm gap-1"
                    >
                      <ArrowRight size={13} />
                    </Link>
                    <RemoveStudentButton
                      classId={cls.id}
                      studentId={student.id}
                    />
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
