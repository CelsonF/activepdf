"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, Student, CalendarBlank, PencilLine } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { SessionRole } from "@/types";

interface SearchItem {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  kind: "student" | "lesson" | "exercise";
}

const KIND_ICON = {
  student: <Student size={13} weight="bold" className="text-violet-500" />,
  lesson: <CalendarBlank size={13} weight="bold" className="text-blue-500" />,
  exercise: <PencilLine size={13} weight="bold" className="text-emerald-500" />,
} as const;

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

async function loadItems(role: SessionRole): Promise<SearchItem[]> {
  const items: SearchItem[] = [];
  const get = (url: string) =>
    fetch(url).then((r) => (r.ok ? r.json() : [])).catch(() => []);

  if (role === "teacher") {
    const [students, lessons] = await Promise.all([get("/api/students"), get("/api/lessons")]);
    for (const s of students as Array<{ id: string; name: string; email: string }>) {
      items.push({ id: s.id, label: s.name, sublabel: s.email, href: `/dashboard/students/${s.id}`, kind: "student" });
    }
    for (const l of lessons as Array<{ id: string; scheduledAt: string; student: { name: string } }>) {
      items.push({ id: l.id, label: `Aula · ${l.student.name}`, sublabel: fmtDate(l.scheduledAt), href: `/dashboard/lessons/${l.id}`, kind: "lesson" });
    }
    return items;
  }

  const [lessons, exercises] = await Promise.all([get("/api/lessons"), get("/api/exercises")]);
  for (const l of lessons as Array<{ id: string; scheduledAt: string; subject: { name: string } | null }>) {
    items.push({ id: l.id, label: `Aula · ${l.subject?.name ?? "sem matéria"}`, sublabel: fmtDate(l.scheduledAt), href: `/dashboard/lessons/${l.id}`, kind: "lesson" });
  }
  for (const e of exercises as Array<{ id: string; title: string; pdfName: string }>) {
    items.push({ id: e.id, label: e.title, sublabel: e.pdfName, href: `/dashboard/exercises/${e.id}`, kind: "exercise" });
  }
  return items;
}

interface SearchBoxProps {
  role: SessionRole;
}

export function SearchBox({ role }: SearchBoxProps) {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchItem[] | null>(null);

  // Carrega o índice uma vez, na primeira abertura
  useEffect(() => {
    if (!open || items !== null) return;
    loadItems(role).then(setItems).catch(() => setItems([]));
  }, [open, items, role]);

  // Fecha ao clicar fora
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? (items ?? []).filter(
        (i) => i.label.toLowerCase().includes(q) || i.sublabel.toLowerCase().includes(q)
      ).slice(0, 8)
    : [];

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={boxRef} className="relative max-w-[280px] flex-1">
      <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-brand/30 transition-shadow">
        <MagnifyingGlass size={14} className="text-slate-400 shrink-0" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && results[0]) go(results[0].href);
          }}
          placeholder={role === "teacher" ? "Buscar alunos, aulas..." : "Buscar aulas, exercícios..."}
          className="bg-transparent outline-none text-[13px] text-slate-700 placeholder:text-slate-400 w-full"
        />
      </div>

      {open && q && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 animate-fadeUp">
          {items === null ? (
            <p className="text-[12px] text-slate-400 px-3 py-2.5">Carregando...</p>
          ) : results.length === 0 ? (
            <p className="text-[12px] text-slate-400 px-3 py-2.5">Nada encontrado para “{query.trim()}”.</p>
          ) : (
            results.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                onClick={() => go(item.href)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left",
                  "hover:bg-slate-50 transition-colors"
                )}
              >
                {KIND_ICON[item.kind]}
                <span className="text-[12.5px] font-medium text-slate-800 truncate">{item.label}</span>
                <span className="ml-auto text-[11px] text-slate-400 truncate shrink-0">{item.sublabel}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
