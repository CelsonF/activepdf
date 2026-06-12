"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";

interface DeleteSubjectButtonProps {
  id: string;
  name: string;
}

export function DeleteSubjectButton({ id, name }: DeleteSubjectButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/dashboard/subjects/${id}`, { method: "DELETE" });
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-500 mr-1">Excluir &quot;{name}&quot;?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="ui-btn ui-btn-danger ui-btn-xs"
        >
          {loading ? "..." : "Sim"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="ui-btn ui-btn-ghost ui-btn-xs"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="ui-btn ui-btn-ghost ui-btn-xs text-red-500 hover:text-red-600"
    >
      <Trash size={13} />
    </button>
  );
}
