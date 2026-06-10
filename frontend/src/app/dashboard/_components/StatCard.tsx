import { cn } from "@/lib/cn";

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  value: number;
  label: string;
}

export function StatCard({ icon, iconBg, value, label }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconBg)}>{icon}</div>
      </div>
      <p className="text-[22px] font-bold text-slate-900 leading-none tabular-nums">{value}</p>
      <p className="text-[11px] text-slate-400 mt-1">{label}</p>
    </div>
  );
}
