"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash, CheckCircle } from "@phosphor-icons/react";

export function DeleteLessonButton({ lessonId, studentId }: { lessonId: string; studentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/dashboard/lessons/${lessonId}`, { method: "DELETE" });
    router.push("/dashboard/lessons");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex gap-1">
        <button onClick={() => setConfirming(false)} className="ui-btn ui-btn-ghost ui-btn-md">Cancelar</button>
        <button onClick={handleDelete} disabled={loading} className="ui-btn ui-btn-md bg-red-600 text-white hover:bg-red-700 gap-1.5">
          {loading ? <div className="ui-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> : <><Trash size={13} /> Confirmar</>}
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="ui-btn ui-btn-ghost ui-btn-md text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5">
      <Trash size={13} /> Excluir
    </button>
  );
}

export function MarkCompleteButton({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    await fetch(`/api/dashboard/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    router.refresh();
  }

  return (
    <button onClick={handleComplete} disabled={loading} className="ui-btn ui-btn-outline ui-btn-md gap-2 w-full justify-center">
      {loading
        ? <div className="ui-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
        : <><CheckCircle size={15} weight="bold" className="text-emerald-600" /> Marcar como concluída</>
      }
    </button>
  );
}
