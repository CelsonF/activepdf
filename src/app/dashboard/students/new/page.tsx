"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";

export default function NewStudentPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", level: "", objective: "", bookRef: "", notes: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email || !form.password) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/dashboard/students/${data.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell breadcrumbs={[{ label: "Alunos", href: "/dashboard/students" }, { label: "Novo aluno" }]}>
      <div className="max-w-lg mx-auto px-4 py-8 animate-fadeUp">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Adicionar aluno</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

          <section className="p-5 bg-white rounded-2xl border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Conta do aluno</h2>
            <div className="flex flex-col gap-3.5">
              <Field label="Nome completo" required>
                <input className="ui-input" type="text" placeholder="Nome do aluno" value={form.name} onChange={(e) => set("name", e.target.value)} required />
              </Field>
              <Field label="Email" required>
                <input className="ui-input" type="email" placeholder="aluno@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
              </Field>
              <Field label="Senha provisória" required hint="O aluno poderá alterar depois">
                <input className="ui-input" type="text" placeholder="Mín. 6 caracteres" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={6} />
              </Field>
            </div>
          </section>

          <section className="p-5 bg-white rounded-2xl border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Plano de aprendizado <span className="text-slate-400 font-normal">(opcional)</span></h2>
            <p className="text-xs text-slate-400 mb-4">Pode ser preenchido depois no perfil do aluno.</p>
            <div className="flex flex-col gap-3.5">
              <Field label="Nível de inglês">
                <select className="ui-input" value={form.level} onChange={(e) => set("level", e.target.value)}>
                  <option value="">Selecione...</option>
                  <option>A1 — Iniciante</option>
                  <option>A2 — Básico</option>
                  <option>B1 — Intermediário</option>
                  <option>B2 — Intermediário avançado</option>
                  <option>C1 — Avançado</option>
                  <option>C2 — Proficiente</option>
                </select>
              </Field>
              <Field label="Objetivo principal">
                <input className="ui-input" type="text" placeholder="Ex: Entrevistas de emprego em inglês" value={form.objective} onChange={(e) => set("objective", e.target.value)} />
              </Field>
              <Field label="Livro de referência">
                <input className="ui-input" type="text" placeholder="Ex: Interchange 5th Ed. — Cambridge" value={form.bookRef} onChange={(e) => set("bookRef", e.target.value)} />
              </Field>
              <Field label="Observações sobre o aluno">
                <textarea className="ui-input resize-none" rows={3} placeholder="Pontos fortes, dificuldades, preferências..." value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </Field>
            </div>
          </section>

          <div className="flex gap-2 justify-end">
            <Link href="/dashboard/students" className="ui-btn ui-btn-ghost ui-btn-md">Cancelar</Link>
            <button type="submit" disabled={loading} className="ui-btn ui-btn-primary ui-btn-md">
              {loading ? <span className="ui-spinner w-3.5 h-3.5 border-2 text-white" /> : "Criar aluno"}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
