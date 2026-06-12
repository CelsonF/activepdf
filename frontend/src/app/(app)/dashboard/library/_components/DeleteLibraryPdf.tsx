"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";

interface DeleteLibraryPdfProps {
  id: string;
  name: string;
}

export function DeleteLibraryPdf({ id }: DeleteLibraryPdfProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    await fetch(`/api/library/${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-red-600 font-semibold">Excluir?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="ui-btn ui-btn-danger ui-btn-xs"
        >
          Sim
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="ui-btn ui-btn-secondary ui-btn-xs"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="ui-btn ui-btn-ghost ui-btn-sm text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200"
    >
      <Trash size={14} />
    </button>
  );
}
