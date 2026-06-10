"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";

interface Subject { id: string; name: string; }

function NewLessonForm() {
  const router = useRouter();
  const params = useSearchParams();
  const studentId = params.get("studentId") ?? "";

  const [form, setForm] = useState({
    studentId,
    subjectId: "",
    scheduledAt: "",
    meetLink: "",
    content: "",
    homework: "",
    notes: "",
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/subjects")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSubjects(data); })
      .catch(() => {});
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.studentId || !form.scheduledAt) { setError("Aluno e data são obrigatórios"); return; }
    setError("");
    setLoading(true);
    try {
      const body = { ...form, subjectId: form.subjectId || null };
      const res = await fetch("/api/dashboard/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/dashboard/students/${form.studentId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const backHref = studentId ? `/dashboard/students/${studentId}` : "/dashboard";

  return (
    <PageShell breadcrumbs={[{ label: "Voltar", href: backHref }, { label: "Nova aula" }]}>
      <div className="max-w-lg mx-auto px-4 py-8 animate-fadeUp">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Agendar aula</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

          <div className="p-5 bg-white rounded-2xl border border-slate-200 flex flex-col gap-3.5">
            {subjects.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Matéria</label>
                <select className="ui-input" value={form.subjectId} onChange={(e) => set("subjectId", e.target.value)}>
                  <option value="">Sem matéria definida</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
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
              <textarea className="ui-input resize-none" rows={3} placeholder="Ex: Unidade 5 — Verbos modais, vocabulário para entrevista de emprego" value={form.content} onChange={(e) => set("content", e.target.value)} />
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
            <Link href={backHref} className="ui-btn ui-btn-ghost ui-btn-md">Cancelar</Link>
            <button type="submit" disabled={loading} className="ui-btn ui-btn-primary ui-btn-md">
              {loading ? <span className="ui-spinner w-3.5 h-3.5 border-2 text-white" /> : "Agendar aula"}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

export default function NewLessonPage() {
  return (
    <Suspense fallback={null}>
      <NewLessonForm />
    </Suspense>
  );
}
