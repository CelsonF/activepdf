"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FilePdf, ArrowLeft } from "@phosphor-icons/react";

function toDatetimeLocal(date: string | Date) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditLessonPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState({
    scheduledAt: "",
    meetLink: "",
    content: "",
    homework: "",
    notes: "",
    status: "SCHEDULED",
  });
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard/lessons/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setStudentName(data.student?.name ?? "");
        setForm({
          scheduledAt: toDatetimeLocal(data.scheduledAt),
          meetLink: data.meetLink ?? "",
          content: data.content ?? "",
          homework: data.homework ?? "",
          notes: data.notes ?? "",
          status: data.status,
        });
      })
      .finally(() => setFetching(false));
  }, [id]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.scheduledAt) { setError("Data é obrigatória"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/lessons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/dashboard/lessons/${id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="ui-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 h-[52px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
          <FilePdf size={14} weight="bold" color="white" />
        </div>
        <span className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">ActivePDF</span>
        <div className="ui-divider" />
        <Link href={`/dashboard/lessons/${id}`} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={14} /> Voltar
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-700">Editar aula</span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 animate-fadeUp">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Editar aula</h1>
          {studentName && <p className="text-sm text-slate-500 mt-0.5">Aluno: {studentName}</p>}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

          <div className="p-5 bg-white rounded-2xl border border-slate-200 flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                className="ui-input"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="SCHEDULED">Agendada</option>
                <option value="COMPLETED">Concluída</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Data e hora <span className="text-red-500">*</span>
              </label>
              <input
                className="ui-input"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => set("scheduledAt", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Link do Meet</label>
              <input
                className="ui-input"
                type="url"
                placeholder="https://meet.google.com/..."
                value={form.meetLink}
                onChange={(e) => set("meetLink", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Conteúdo da aula</label>
              <textarea
                className="ui-input resize-none"
                rows={3}
                placeholder="Ex: Unidade 5 — Verbos modais, vocabulário para entrevista de emprego"
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lição de casa</label>
              <textarea
                className="ui-input resize-none"
                rows={2}
                placeholder="Exercícios para fazer antes da próxima aula"
                value={form.homework}
                onChange={(e) => set("homework", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notas privadas <span className="text-slate-400 font-normal">(só você vê)</span>
              </label>
              <textarea
                className="ui-input resize-none"
                rows={2}
                placeholder="Observações sobre o progresso do aluno"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Link href={`/dashboard/lessons/${id}`} className="ui-btn ui-btn-ghost ui-btn-md">
              Cancelar
            </Link>
            <button type="submit" disabled={loading} className="ui-btn ui-btn-primary ui-btn-md">
              {loading
                ? <div className="ui-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                : "Salvar alterações"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
