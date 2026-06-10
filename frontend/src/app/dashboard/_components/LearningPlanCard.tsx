interface LearningPlanCardProps {
  plan: { level: string; objective: string; bookRef: string | null };
  subjects: Array<{ subject: { id: string; name: string } }>;
}

export function LearningPlanCard({ plan, subjects }: LearningPlanCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="text-[13px] font-bold text-slate-700 mb-3">Meu plano</h2>
      <div className="flex items-center gap-3 mb-3">
        <span className="px-2.5 py-1 rounded-lg bg-brand-light text-brand text-sm font-bold">
          {plan.level}
        </span>
        {plan.bookRef && <span className="text-xs text-slate-500">{plan.bookRef}</span>}
      </div>
      <p className="text-[12.5px] text-slate-600 leading-snug">{plan.objective}</p>
      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
          {subjects.map(({ subject }) => (
            <span key={subject.id} className="ui-badge ui-badge-brand ui-badge-sm">{subject.name}</span>
          ))}
        </div>
      )}
    </div>
  );
}
