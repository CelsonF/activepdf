import { ProgressRing } from "@/components/ui";

interface ExerciseProgressCardProps {
  completed: number;
  total: number;
}

export function ExerciseProgressCard({ completed, total }: ExerciseProgressCardProps) {
  const pct = Math.round((completed / total) * 100);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="text-[13px] font-bold text-slate-700 mb-4">Progresso geral</h2>
      <div className="flex items-center gap-4">
        <ProgressRing size={72} value={pct} stroke={6}>
          <span className="text-[14px] font-bold text-slate-900">{pct}%</span>
        </ProgressRing>
        <div>
          <p className="text-[14px] font-bold text-slate-800">{completed} de {total}</p>
          <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">exercícios concluídos</p>
        </div>
      </div>
    </div>
  );
}
