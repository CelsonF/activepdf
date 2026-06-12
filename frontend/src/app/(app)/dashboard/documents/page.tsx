import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { FloppyDisk, FilePdf, Plus, ArrowRight, Crown } from "@phosphor-icons/react/dist/ssr";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteDocumentButton } from "./_components/DeleteDocumentButton";
import type { DocumentsUsage, SavedDocumentMeta } from "@/types";

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function DocumentsPage() {
  const session = await getSession();
  if (!session || session.role !== "student") redirect("/dashboard");

  const [docs, usage] = await Promise.all([
    serverFetch<SavedDocumentMeta[]>("/api/documents"),
    serverFetch<DocumentsUsage>("/api/documents/usage"),
  ]);
  const atLimit = usage.limit !== null && usage.used >= usage.limit;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 h-[60px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
          <FloppyDisk size={14} weight="bold" color="white" />
        </div>
        <h1 className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">
          Meus documentos
        </h1>
        <span className="font-mono text-xs text-slate-400">
          {usage.used} de {usage.limit ?? "∞"}
        </span>
        <div className="ml-auto">
          {!atLimit && (
            <Link href="/dashboard/documents/new" className="ui-btn ui-btn-primary ui-btn-sm gap-1.5">
              <Plus size={13} weight="bold" /> Novo documento
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
        {atLimit && (
          <div className="flex flex-wrap items-center gap-4 p-5 rounded-2xl border border-brand bg-brand-light">
            <Crown size={22} weight="fill" className="text-brand shrink-0" />
            <div className="flex-1 min-w-[220px]">
              <p className="text-sm font-semibold text-slate-900">
                Você usou seus {usage.limit} documentos grátis
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Exclua um documento para liberar espaço — ou conheça o plano
                Professor, com documentos ilimitados.
              </p>
            </div>
            <Link href="/precos" className="ui-btn ui-btn-primary ui-btn-sm gap-1">
              Conhecer o plano Professor <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {docs.length === 0 ? (
          <EmptyState
            icon={<FilePdf size={40} />}
            title="Nenhum documento salvo ainda"
            description="Envie um PDF, crie seus campos e salve para continuar depois."
            action={
              <Link href="/dashboard/documents/new" className="ui-btn ui-btn-primary ui-btn-sm gap-1.5">
                <Plus size={13} weight="bold" /> Novo documento
              </Link>
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-card"
              >
                <span className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                  <FilePdf size={16} className="text-brand" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{doc.title}</p>
                  <p className="font-mono text-[11px] text-slate-400 truncate">
                    {doc.pdfName}.pdf · atualizado {fmtDate(doc.updatedAt)}
                  </p>
                </div>
                <Link
                  href={`/dashboard/documents/${doc.id}`}
                  className="ui-btn ui-btn-outline ui-btn-sm gap-1"
                >
                  Abrir <ArrowRight size={12} />
                </Link>
                <DeleteDocumentButton id={doc.id} title={doc.title} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
