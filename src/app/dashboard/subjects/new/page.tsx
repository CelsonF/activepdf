"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FilePdf, ArrowLeft, Books } from "@phosphor-icons/react";

export default function NewSubjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("O nome da matéria é obrigatório.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/dashboard/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    });

    if (res.ok) {
      router.push("/dashboard/subjects");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao criar matéria.");
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
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <span className="text-slate-300">/</span>
        <Link href="/dashboard/subjects" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
          Matérias
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-700">Nova matéria</span>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeUp">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Books size={18} weight="bold" className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Nova matéria</h1>
            <p className="text-sm text-slate-500 mt-0.5">Preencha os dados da matéria</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 bg-white rounded-2xl border border-slate-200 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nome <span className="text-red-400">*</span>
            </label>
            <input
              className="ui-input w-full"
              placeholder="Ex: Inglês, Matemática…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Descrição <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              className="ui-input w-full resize-none"
              rows={3}
              placeholder="Descreva o conteúdo ou objetivo da matéria…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button type="submit" disabled={loading} className="ui-btn ui-btn-primary ui-btn-md">
              {loading ? <span className="ui-spinner" /> : "Criar matéria"}
            </button>
            <Link href="/dashboard/subjects" className="ui-btn ui-btn-ghost ui-btn-md">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
