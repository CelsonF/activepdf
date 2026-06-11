import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Estado vazio padrão: card tracejado com ícone, mensagem e ação opcional. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-14 px-6",
        "bg-white rounded-2xl border border-dashed border-slate-300",
        className,
      )}
    >
      <span className="text-slate-300 mb-3 [&>svg]:mx-auto">{icon}</span>
      <p className="text-sm text-slate-500">{title}</p>
      {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
