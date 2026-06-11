"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, PencilLine } from "@phosphor-icons/react";
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui";
import type { SessionRole } from "@/types";

interface PendingItem {
  id: string;
  title: string;
  status: string;
}

interface NotificationsBellProps {
  role: SessionRole;
}

export function NotificationsBell({ role }: NotificationsBellProps) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingItem[]>([]);

  useEffect(() => {
    fetch("/api/exercises")
      .then((r) => (r.ok ? r.json() : []))
      .then((exs: Array<{ id: string; title: string; status: string }>) => {
        const items =
          role === "teacher"
            ? exs.filter((e) => e.status === "completed")
            : exs.filter((e) => e.status === "assigned" || e.status === "in_progress");
        setPending(items);
      })
      .catch(() => undefined);
  }, [role]);

  const header =
    role === "teacher"
      ? `${pending.length} exercício${pending.length !== 1 ? "s" : ""} para corrigir`
      : `${pending.length} exercício${pending.length !== 1 ? "s" : ""} para fazer`;
  const baseHref = role === "teacher" ? "/dashboard/corrections" : "/dashboard/exercises";

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notificações"
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <Bell size={17} weight="bold" />
          {pending.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand ring-2 ring-white" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[260px]">
        <DropdownMenuLabel>
          {pending.length === 0 ? "Tudo em dia 🎉" : header}
        </DropdownMenuLabel>
        {pending.slice(0, 5).map((item) => (
          <DropdownMenuItem
            key={item.id}
            icon={<PencilLine size={13} className="text-emerald-600" />}
            onSelect={() => router.push(`${baseHref}/${item.id}`)}
          >
            <span className="truncate">{item.title}</span>
          </DropdownMenuItem>
        ))}
        {pending.length > 5 && (
          <DropdownMenuItem onSelect={() => router.push(baseHref)}>
            Ver todos ({pending.length})
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}
