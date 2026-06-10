"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "@phosphor-icons/react";
import { PageShell } from "@/components/ui/PageShell";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "Master"];

interface Plan {
  level: string;
  objective: string;
  bookRef: string;
  notes: string;
}

export default function StudentPlanPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<Plan>({ level: "A1", objective: "", bookRef: "", notes: "" });
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard/students/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setStudentName(data.name ?? "");
        if (data.learningPlan) {
          setForm({
            level: data.learningPlan.level ?? "A1",
            objective: data.learningPlan.objective ?? "",
            bookRef: data.learningPlan.bookRef ?? "",
            notes: data.learningPlan.notes ?? "",
          });
        }
      })
      .finally(() => setFetching(false));
  }, [id]);

  function set(field: keyof Plan, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.level || !form.objective.trim()) { setError("Nível e objetivo são obrigatórios"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/students/${id}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: form.level,
          objective: form.objective.trim(),
          bookRef: form.bookRef.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao salvar"); return; }
      router.push(`/dashboard/students/${id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const breadcrumbs = [
    { label: studentName || "Aluno", href: `/dashboard/students/${id}` },
    { label: "Plano de aprendizado" },
  ];

  if (fetching) {
    return (
      <PageShell breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center py-20">
          <span className="ui-spinner" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell breadcrumbs={breadcrumbs}>
      <div className="max-w-lg mx-auto px-4 py-8 animate-fadeUp">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
            <BookOpen size={18} weight="bold" className="text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Plano de aprendizado</h1>
            {studentName && <p className="text-sm text-slate-500">{studentName}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

          <div className="p-5 bg-white rounded-2xl border border-slate-200 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nível CEFR <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CEFR_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => set("level", lvl)}
                    className={`px-3 py-1.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                      form.level === lvl
                        ? "border-brand bg-brand-light text-brand"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Objetivo <span className="text-red-500">*</span>
              </label>
              <textarea className="ui-input resize-none" rows={3} placeholder="Ex: Atingir fluência para entrevistas de emprego em inglês" value={form.objective} onChange={(e) => set("objective", e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Livro de referência</label>
              <input className="ui-input" type="text" placeholder="Ex: Interchange 2 (Cambridge)" value={form.bookRef} onChange={(e) => set("bookRef", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notas da professora <span className="text-slate-400 font-normal">(não visível para o aluno)</span>
              </label>
              <textarea className="ui-input resize-none" rows={3} placeholder="Observações sobre o progresso, pontos fortes e fraquezas" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Link href={`/dashboard/students/${id}`} className="ui-btn ui-btn-ghost ui-btn-md">Cancelar</Link>
            <button type="submit" disabled={loading} className="ui-btn ui-btn-primary ui-btn-md">
              {loading ? <span className="ui-spinner w-3.5 h-3.5 border-2 text-white" /> : "Salvar plano"}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
