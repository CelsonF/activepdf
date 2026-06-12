"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

interface Props {
  id: string;
  title: string;
}

export function DeleteDocumentButton({ id, title }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleDelete() {
    if (!confirm(`Excluir "${title}"? Essa ação não tem volta.`)) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={<Trash size={13} />}
      loading={loading}
      onClick={handleDelete}
      title={error ? "Erro ao excluir. Tente novamente." : "Excluir documento"}
      className={error ? "text-correction" : undefined}
    />
  );
}
