"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "@phosphor-icons/react";

interface Props {
  studentId: string;
}

/** Badge "Autodidata" + ação do professor para converter em aluno regular. */
export function AutodidactBadge({ studentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConvert() {
    if (!confirm("Tornar este aluno regular? Ele perderá o acesso ao editor de exercícios próprios.")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAutodidact: false }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao atualizar o aluno.");
        return;
      }
      router.refresh();
    } catch {
      setError("Erro ao atualizar o aluno.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="ui-badge ui-badge-brand ui-badge-sm">Autodidata</span>
      <button
        onClick={handleConvert}
        disabled={loading}
        className="ui-btn ui-btn-secondary ui-btn-xs gap-1"
      >
        {loading ? (
          <span className="ui-spinner w-3 h-3 border-2" />
        ) : (
          <GraduationCap size={11} weight="bold" />
        )}
        Tornar aluno regular
      </button>
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </span>
  );
}
