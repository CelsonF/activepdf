"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Books } from "@phosphor-icons/react";
import { PageShell } from "@/components/ui/PageShell";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Matérias", href: "/dashboard/subjects" },
  { label: "Editar matéria" },
];

interface Props {
  params: { id: string };
}

export default function EditSubjectPage({ params }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard/subjects/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name ?? "");
        setDescription(data.description ?? "");
      })
      .catch(() => setError("Erro ao carregar matéria."))
      .finally(() => setFetching(false));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError("O nome da matéria é obrigatório."); return; }
    setLoading(true);
    const res = await fetch(`/api/dashboard/subjects/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    });
    if (res.ok) {
      router.push("/dashboard/subjects");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao salvar matéria.");
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <PageShell breadcrumbs={BREADCRUMBS}>
        <div className="flex items-center justify-center py-20">
          <span className="ui-spinner" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell breadcrumbs={BREADCRUMBS}>
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeUp">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Books size={18} weight="bold" className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Editar matéria</h1>
            <p className="text-sm text-slate-500 mt-0.5">Atualize os dados da matéria</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 bg-white rounded-2xl border border-slate-200 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nome <span className="text-red-400">*</span>
            </label>
            <input className="ui-input w-full" placeholder="Ex: Inglês, Matemática…" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Descrição <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea className="ui-input w-full resize-none" rows={3} placeholder="Descreva o conteúdo ou objetivo da matéria…" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex items-center gap-2 pt-1">
            <button type="submit" disabled={loading} className="ui-btn ui-btn-primary ui-btn-md">
              {loading ? <span className="ui-spinner" /> : "Salvar alterações"}
            </button>
            <Link href="/dashboard/subjects" className="ui-btn ui-btn-ghost ui-btn-md">Cancelar</Link>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
