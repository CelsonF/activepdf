"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FilePdf, ArrowLeft } from "@phosphor-icons/react";

function NewLessonForm() {
  const router = useRouter();
  const params = useSearchParams();
  const studentId = params.get("studentId") ?? "";

  const [form, setForm] = useState({
    studentId,
    scheduledAt: "",
    meetLink: "",
    content: "",
    homework: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.studentId || !form.scheduledAt) { setError("Aluno e data são obrigatórios"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/dashboard/students/${form.studentId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 h-[52px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
          <FilePdf size={14} weight="bold" color="white" />
        </div>
        <span className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">ActivePDF</span>
        <div className="ui-divider" />
        <Link href={studentId ? `/dashboard/students/${studentId}` : "/dashboard"} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={14} /> Voltar
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-700">Nova aula</span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 animate-fadeUp">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Agendar aula</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

          <div className="p-5 bg-white rounded-2xl border border-slate-200 flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Data e hora <span className="text-red-500">*</span></label>
              <input className="ui-input" type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Link do Meet</label>
              <input className="ui-input" type="url" placeholder="https://meet.google.com/..." value={form.meetLink} onChange={(e) => set("meetLink", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Conteúdo da aula</label>
              <textarea className="ui-input resize-none" rows={3} placeholder="Ex: Unit 5 — Modal verbs, job interview vocabulary" value={form.content} onChange={(e) => set("content", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lição de casa</label>
              <textarea className="ui-input resize-none" rows={2} placeholder="Exercícios para fazer antes da próxima aula" value={form.homework} onChange={(e) => set("homework", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notas privadas <span className="text-slate-400 font-normal">(só você vê)</span></label>
              <textarea className="ui-input resize-none" rows={2} placeholder="Observações sobre o progresso do aluno" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Link href={studentId ? `/dashboard/students/${studentId}` : "/dashboard"} className="ui-btn ui-btn-ghost ui-btn-md">Cancelar</Link>
            <button type="submit" disabled={loading} className="ui-btn ui-btn-primary ui-btn-md">
              {loading ? <div className="ui-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "Agendar aula"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewLessonPage() {
  return (
    <Suspense fallback={null}>
      <NewLessonForm />
    </Suspense>
  );
}
