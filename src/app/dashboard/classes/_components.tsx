"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Chalkboard, UsersThree, Trash } from "@phosphor-icons/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";
import { DialogRoot, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/Dialog";

interface Student {
  id: string;
  name: string;
  email: string;
}

// ── Create Class Modal ────────────────────────────────────────────────────────

interface CreateModalProps {
  students: Student[];
  onClose: () => void;
  open: boolean;
}

export function CreateClassModal({ students, onClose, open }: CreateModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    if (!name.trim()) { setError("Informe o nome da turma."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          studentIds: Array.from(selected),
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setError(err.error ?? "Erro ao criar turma.");
        return;
      }
      const data = await res.json() as { id: string };
      router.push(`/dashboard/classes/${data.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh]">
        <DialogHeader
          title="Nova turma"
          icon={<Chalkboard size={14} weight="bold" className="text-blue-600" />}
        />

        <div className="px-5 py-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
              Nome *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Turma B1 — Manhã"
              className="ui-input"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Observações sobre esta turma..."
              className="ui-input resize-none"
              rows={2}
            />
          </div>

          {students.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Adicionar alunos
                </label>
                <span className="text-[11px] text-slate-400">
                  {selected.size} selecionado{selected.size !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {students.map((s) => {
                  const sel = selected.has(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggle(s.id)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-colors w-full",
                        sel ? "border-brand bg-brand-light" : "border-slate-200 hover:border-slate-300 bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                        sel ? "bg-brand border-brand" : "border-slate-300"
                      )}>
                        {sel && (
                          <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-current">
                            <path d="M1.5 6L4.5 9L10.5 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-xs font-semibold truncate", sel ? "text-brand" : "text-slate-700")}>{s.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{s.email}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </div>

        <DialogFooter>
          <button onClick={onClose} className="ui-btn ui-btn-secondary ui-btn-md">Cancelar</button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="ui-btn ui-btn-primary ui-btn-md gap-1.5"
          >
            {saving
              ? <span className="ui-spinner w-3.5 h-3.5 border-2 text-white" />
              : <Plus size={13} weight="bold" />}
            Criar turma
          </button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

// ── Page trigger ──────────────────────────────────────────────────────────────

export function ClassesPageClient({ students }: { students: Student[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="ui-btn ui-btn-primary ui-btn-md gap-1.5">
        <Plus size={14} weight="bold" /> Nova turma
      </button>
      <CreateClassModal students={students} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ── Delete class button ───────────────────────────────────────────────────────

export function DeleteClassButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    await fetch(`/api/classes/${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-red-600 font-semibold">Excluir?</span>
        <button onClick={handleDelete} disabled={isPending} className="ui-btn ui-btn-danger ui-btn-xs">Sim</button>
        <button onClick={() => setConfirming(false)} className="ui-btn ui-btn-secondary ui-btn-xs">Não</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="ui-btn ui-btn-ghost ui-btn-sm text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200"
    >
      <Trash size={14} />
    </button>
  );
}

// ── Remove student from class button ─────────────────────────────────────────

export function RemoveStudentButton({ classId, studentId }: { classId: string; studentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await fetch(`/api/classes/${classId}/students/${studentId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="ui-btn ui-btn-ghost ui-btn-xs text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200"
      title="Remover da turma"
    >
      <X size={12} />
    </button>
  );
}

// ── Add student to class button ───────────────────────────────────────────────

interface AddStudentProps {
  classId: string;
  existingIds: string[];
  allStudents: Student[];
}

export function AddStudentToClass({ classId, existingIds, allStudents }: AddStudentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const available = allStudents.filter((s) => !existingIds.includes(s.id));

  async function add(studentId: string) {
    setLoading(true);
    await fetch(`/api/classes/${classId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    router.refresh();
    setLoading(false);
  }

  if (available.length === 0) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="ui-btn ui-btn-secondary ui-btn-sm gap-1">
          <UsersThree size={13} /> Adicionar aluno
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-20 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 animate-fadeUp"
        >
          {available.map((s) => (
            <DropdownMenu.Item
              key={s.id}
              disabled={loading}
              onSelect={() => add(s.id)}
              className="px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 outline-none data-[highlighted]:bg-slate-50 transition-colors"
            >
              <p className="font-semibold text-slate-700 truncate">{s.name}</p>
              <p className="text-slate-400 truncate">{s.email}</p>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
