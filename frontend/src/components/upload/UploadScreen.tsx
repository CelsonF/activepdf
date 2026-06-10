"use client";
import { useRef, useState } from "react";
import {
  FilePdf,
  UploadSimple,
  Lock,
  PencilSimple,
  ArrowsOut,
  Export,
  Cursor,
  GraduationCap,
  SquaresFour,
  SignOut,
} from "@phosphor-icons/react";
import { useEditor } from "@/store";
import { Button } from "@/components/ui/Button";
import type { SessionRole } from "@/types";

const STEPS: { icon: typeof FilePdf; text: string }[] = [
  { icon: UploadSimple, text: "Carregue seu PDF (livro, apostila, lista de exercícios)" },
  { icon: Cursor,       text: "Navegue até a página com o exercício" },
  { icon: PencilSimple, text: "Clique e arraste sobre cada espaço em branco — um campo editável aparece" },
  { icon: ArrowsOut,    text: "Arraste e redimensione cada campo como quiser" },
  { icon: Export,       text: "Escolha o tipo de export e baixe o PDF pronto" },
];

interface Props { role: SessionRole; name: string; }

export function UploadScreen({ role, name }: Props) {
  const { loadPdf } = useEditor();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") { setError("Por favor, envie um arquivo PDF."); return; }
    setLoading(true); setError("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
      const buf = await file.arrayBuffer();
      const bytes = buf.slice(0);
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      const name = file.name.replace(/\.pdf$/i, "");
      loadPdf(doc, bytes, name, doc.numPages);
    } catch (e: unknown) {
      setError("Erro ao carregar PDF: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
  }

  async function handleLogout() {
    if (!confirm("Sair da sessão?")) return;
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-upload-gradient">
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 h-[52px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
            <FilePdf size={14} weight="bold" color="white" />
          </div>
          <span className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px]">ActivePDF</span>
        </div>
        <div className="flex items-center gap-2">
          <a href="/dashboard" className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-brand transition-colors px-2 py-1 rounded-lg hover:bg-slate-100">
            <SquaresFour size={13} /> Painel
          </a>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
            <GraduationCap size={12} weight="bold" className="text-brand" />
            <span className="text-xs font-semibold text-slate-700">{name}</span>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Sair">
            <SignOut size={14} />
          </button>
        </div>
      </header>

    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-[600px]">

        {/* Logo */}
        <div className="animate-fadeUp text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-[14px] bg-brand flex items-center justify-center shadow-brand-lg">
              <FilePdf size={26} weight="bold" color="white" />
            </div>
            <h1 className="text-[28px] font-extrabold text-slate-900 tracking-[-0.5px]">
              ActivePDF
            </h1>
          </div>
          <p className="text-base text-slate-600 leading-relaxed max-w-[460px] mx-auto">
            Adicione campos de resposta interativos em qualquer PDF — sem servidor, sem cadastro.
          </p>
        </div>

        {/* Drop zone */}
        <div
          className="animate-fadeUp [animation-delay:0.05s]"
          onClick={() => !loading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          <div
            className={[
              "border-2 border-dashed rounded-[18px] px-8 py-[52px] text-center transition-all duration-200",
              loading ? "cursor-default" : "cursor-pointer",
              dragging
                ? "border-brand bg-brand-light shadow-[0_0_0_4px_rgba(79,70,229,0.1),0_4px_20px_rgba(79,70,229,0.08)]"
                : "border-slate-300 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
            ].join(" ")}
          >
            <div
              className={[
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 transition-all duration-200",
                dragging ? "bg-brand/10" : "bg-slate-100",
              ].join(" ")}
            >
              {loading ? (
                <div
                  className="ui-spinner"
                  style={{ width: 32, height: 32, borderWidth: 3, borderColor: "var(--border)", borderTopColor: "var(--brand)" }}
                />
              ) : (
                <UploadSimple size={36} className={dragging ? "text-brand" : "text-slate-500"} />
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {loading ? "Carregando PDF..." : "Arraste seu PDF aqui"}
            </h3>
            <p className="text-slate-600 mb-6 text-sm">
              {loading ? "Processando páginas..." : "ou clique para selecionar do seu computador"}
            </p>

            {!loading && (
              <Button
                variant="primary"
                size="md"
                icon={<FilePdf size={16} weight="bold" />}
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              >
                Escolher arquivo
              </Button>
            )}

            <div className="inline-flex items-center gap-[5px] text-xs text-slate-400 mt-5">
              <Lock size={12} />
              Seus arquivos ficam apenas no seu navegador
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Como funciona */}
        <div className="animate-fadeUp [animation-delay:0.1s] mt-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <h4 className="text-[13px] font-bold text-slate-900 mb-3.5 flex items-center gap-1.5">
            <span className="text-brand">⚡</span> Como funciona
          </h4>
          <ol className="list-none flex flex-col gap-2.5">
            {STEPS.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex gap-3 items-start text-[13px] text-slate-600">
                <span className="flex items-center justify-center w-6 h-6 rounded-[6px] bg-brand-light text-brand shrink-0 mt-px">
                  <Icon size={13} weight="bold" />
                </span>
                <span className="leading-[1.5]">{text}</span>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </div>
    </div>
  );
}
