import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import {
  Books,
  FilePdf,
  Tag,
  Eye,
  FileArrowUp,
} from "@phosphor-icons/react/dist/ssr";
import { DeleteLibraryPdf, LibraryPageClient } from "./_components";

interface LibraryItem {
  id: string;
  name: string;
  description: string | null;
  tags: string;
  pageCount: number | null;
  fileSize: number | null;
  createdAt: string;
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtSize(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function LibraryPage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  const items = await serverFetch<LibraryItem[]>("/api/library");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-[60px] flex items-center gap-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
          <Books size={14} weight="bold" color="white" />
        </div>
        <h1 className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">
          Biblioteca
        </h1>
        <span className="text-xs text-slate-400 font-medium">
          {items.length} PDF{items.length !== 1 ? "s" : ""}
        </span>

        <div className="ml-auto">
          <LibraryPageClient />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeUp">
        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
              <FileArrowUp size={28} className="text-violet-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">
              Biblioteca vazia
            </p>
            <p className="text-xs text-slate-400 mb-5 text-center max-w-xs">
              Adicione PDFs à sua biblioteca para reutilizá-los em exercícios e
              aulas.
            </p>
            <LibraryPageClient />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => {
              const tags: string[] = (() => {
                try {
                  return JSON.parse(item.tags);
                } catch {
                  return [];
                }
              })();

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-sm transition-all flex flex-col"
                >
                  {/* Card top */}
                  <div className="px-4 pt-4 pb-3 flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                      <FilePdf
                        size={18}
                        weight="fill"
                        className="text-violet-600"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                        {item.pageCount != null && (
                          <span>{item.pageCount}p</span>
                        )}
                        {fmtSize(item.fileSize) && (
                          <>
                            <span>·</span>
                            <span>{fmtSize(item.fileSize)}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{fmtDate(item.createdAt)}</span>
                      </div>

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tags.map((t) => (
                            <span
                              key={t}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-semibold border border-violet-100"
                            >
                              <Tag size={8} /> {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      href={`/dashboard/library/${item.id}`}
                      className="ui-btn ui-btn-secondary ui-btn-sm gap-1 flex-1 justify-center"
                    >
                      <Eye size={13} /> Abrir
                    </Link>
                    <DeleteLibraryPdf id={item.id} name={item.name} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
