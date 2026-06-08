"use client";
import { useState, useEffect, useRef } from "react";
import {
  FilePdf, PencilSimple, TextAlignLeft, DownloadSimple,
  Trash, ArrowCounterClockwise, Scan, GraduationCap, BookOpen,
  SignOut, SquaresFour, FloppyDisk, CheckCircle, CloudArrowUp, Circle,
} from "@phosphor-icons/react";
import { SaveExerciseModal } from "./SaveExerciseModal";
import { useEditor } from "@/store";
import { exportPDF, exportFilledPDF } from "@/lib/export";
import { toast } from "./Toast";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Divider, ModeBtn } from "@/components/ui/Buttons";
import type { ExportMode, SessionRole } from "@/types";

const EXPORT_MODES: { mode: ExportMode; label: string; title: string }[] = [
  { mode: "interactive", label: "Interativo",   title: "PDF original + campos AcroForm preenchíveis" },
  { mode: "watermark",   label: "Marca d'água", title: "Original apagado no fundo + campos proeminentes" },
  { mode: "answers",     label: "Só respostas", title: "Folha limpa apenas com campos de resposta" },
];

interface Props { role: SessionRole; name: string; exerciseId: string | null; savedAnswersJson?: string; }

function Brand() {
  return (
    <div className="flex items-center gap-[7px]">
      <div className="w-[30px] h-[30px] rounded-lg bg-brand flex items-center justify-center shrink-0 shadow-brand">
        <FilePdf size={16} weight="bold" color="white" />
      </div>
      <span className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px] whitespace-nowrap">
        ActivePDF
      </span>
    </div>
  );
}

function UserChip({ role, name }: { role: SessionRole; name: string }) {
  const resetPdf = useEditor((s) => s.resetPdf);

  async function handleLogout() {
    if (!confirm("Sair da sessão?")) return;
    resetPdf();
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
      <a href="/dashboard" className="ui-btn ui-btn-ghost ui-btn-xs gap-1" title="Ir para o painel">
        <SquaresFour size={12} /> Painel
      </a>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">
        {role === "teacher"
          ? <GraduationCap size={12} weight="bold" className="text-brand" />
          : <BookOpen size={12} weight="bold" className="text-emerald-600" />}
        <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">{name}</span>
      </div>
      <Button variant="ghost" size="xs" icon={<SignOut size={12} />} title="Sair" onClick={handleLogout} />
    </div>
  );
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function Toolbar({ role, name, exerciseId, savedAnswersJson }: Props) {
  const {
    pdfDoc, pdfBytes, pdfName, currentPage,
    fields, fieldValues, exportMode, appMode,
    ocrOpen,
    setExportMode, resetPdf, clearPageFields,
    setAppMode, clearFieldValues, setOcrOpen,
  } = useEditor();

  const isTeacher = role === "teacher";
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const lastSavedRef = useRef<string>(savedAnswersJson ?? "{}");
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Track whether current answers differ from last saved
  useEffect(() => {
    if (!exerciseId || isTeacher) return;
    setHasUnsaved(JSON.stringify(fieldValues) !== lastSavedRef.current);
  }, [fieldValues, exerciseId, isTeacher]);

  async function handleSaveProgress(markComplete = false) {
    if (!exerciseId) return;
    setSaveStatus("saving");
    try {
      const answersJson = JSON.stringify(fieldValues);
      const status = markComplete ? "completed" : "in_progress";
      const res = await fetch(`/api/exercises/${exerciseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answersJson, status }),
      });
      if (!res.ok) throw new Error();
      lastSavedRef.current = answersJson;
      setHasUnsaved(false);
      setSaveStatus("saved");
      if (markComplete) toast("Exercício concluído!", "success");
      else toast("Progresso salvo!", "success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      toast("Erro ao salvar. Tente novamente.", "error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  async function handleExportDesign() {
    if (!fields.length) { toast("Adicione pelo menos um campo antes de exportar", "error"); return; }
    if (!pdfBytes || !pdfDoc) { toast("PDF não disponível. Carregue novamente.", "error"); return; }
    try {
      const msg = await exportPDF(exportMode, pdfBytes, pdfDoc, fields, pdfName, (s) => toast(s));
      toast(msg, "success");
    } catch (e: any) {
      toast("Erro ao exportar: " + (e.message || String(e)), "error");
    }
  }

  async function handleExportFilled() {
    if (!fields.length) { toast("Não há campos definidos para exportar", "error"); return; }
    if (!pdfBytes) { toast("PDF não disponível. Carregue novamente.", "error"); return; }
    const filledCount = fields.filter((f) => fieldValues[f.id]?.trim()).length;
    if (!filledCount) { toast("Preencha pelo menos um campo antes de exportar", "error"); return; }
    try {
      const msg = await exportFilledPDF(pdfBytes, fields, fieldValues, pdfName, (s) => toast(s));
      toast(msg, "success");
    } catch (e: any) {
      toast("Erro ao exportar: " + (e.message || String(e)), "error");
    }
  }

  const fieldCount  = fields.length;
  const filledCount = fields.filter((f) => fieldValues[f.id]?.trim()).length;
  const isFill = appMode === "fill";

  const leftSection = (
    <>
      {isTeacher && (
        <div className="flex items-center bg-slate-100 rounded-lg p-[3px] gap-0.5">
          <ModeBtn active={!isFill} onClick={() => setAppMode("design")} title="Arraste para criar campos, mova e redimensione">
            <PencilSimple size={13} weight={!isFill ? "bold" : "regular"} />
            Editar campos
          </ModeBtn>
          <ModeBtn active={isFill} onClick={() => setAppMode("fill")} title="Clique nos campos e escreva as respostas">
            <TextAlignLeft size={13} weight={isFill ? "bold" : "regular"} />
            Preencher
          </ModeBtn>
        </div>
      )}

      {isTeacher && <Divider />}

      {isTeacher && !isFill && (
        <div className="flex items-center gap-[5px]">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Exportar como:</span>
          {EXPORT_MODES.map(({ mode, label, title }) => (
            <button
              key={mode}
              className="ui-export-btn"
              title={title}
              data-active={exportMode === mode ? "true" : "false"}
              onClick={() => { setExportMode(mode); toast("Modo: " + label); }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {isFill && (
        <div className="flex items-center gap-2">
          <Badge variant="brand" icon={<PencilSimple size={11} />}>Preenchimento</Badge>
          {filledCount > 0 && (
            <span className="text-xs text-slate-400">{filledCount}/{fieldCount} preenchido{filledCount !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}

      {isTeacher && (
        <>
          <Divider />
          <button
            className="ui-export-btn"
            data-active={ocrOpen ? "true" : "false"}
            onClick={() => setOcrOpen(!ocrOpen)}
            title="Extrair texto das páginas com OCR"
          >
            <Scan size={14} /> OCR
          </button>
        </>
      )}
    </>
  );

  const rightSection = (
    <>
      {isTeacher && !isFill && (
        <>
          {fieldCount > 0 && (
            <span className="text-[11px] text-slate-400 font-medium">{fieldCount} campo{fieldCount !== 1 ? "s" : ""}</span>
          )}
          <Button variant="ghost" size="sm" icon={<Trash size={13} />} title="Apagar campos desta página"
            onClick={() => {
              const n = fields.filter((f) => f.page === currentPage).length;
              if (!n) { toast("Esta página já não tem campos", "error"); return; }
              if (confirm(`Apagar todos os ${n} campos desta página?`)) clearPageFields(currentPage);
            }}
          >Limpar</Button>
          <Button variant="ghost" size="sm" icon={<ArrowCounterClockwise size={13} />} title="Carregar novo PDF"
            onClick={() => { if (confirm("Voltar ao início? Os campos serão perdidos.")) resetPdf(); }}
          >Novo</Button>
          {fields.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={<FloppyDisk size={13} weight="bold" />}
              title="Salvar este PDF com os campos como exercício para um aluno"
              onClick={() => setSaveModalOpen(true)}
            >
              Salvar exercício
            </Button>
          )}
          <Button variant="primary" size="sm" icon={<DownloadSimple size={13} weight="bold" />} onClick={handleExportDesign}>
            Exportar PDF
          </Button>
        </>
      )}

      {isFill && (
        <>
          <Button variant="ghost" size="sm" icon={<Trash size={13} />} title="Limpar todas as respostas"
            onClick={() => { if (confirm("Limpar todas as respostas?")) clearFieldValues(); }}
          >Limpar</Button>
          <Button variant="success" size="sm" icon={<DownloadSimple size={13} weight="bold" />} onClick={handleExportFilled}>
            Exportar
          </Button>
          {!isTeacher && exerciseId && (
            <>
              {saveStatus === "saved" && !hasUnsaved && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <CheckCircle size={12} weight="fill" /> Salvo
                </span>
              )}
              {hasUnsaved && saveStatus !== "saving" && (
                <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                  <Circle size={8} weight="fill" /> Não salvo
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                icon={<CloudArrowUp size={13} weight="bold" />}
                title="Salvar progresso"
                onClick={() => handleSaveProgress(false)}
                disabled={saveStatus === "saving" || !hasUnsaved}
              >
                {saveStatus === "saving" ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle size={13} weight="bold" />}
                title="Marcar como concluído e salvar"
                onClick={() => handleSaveProgress(true)}
                disabled={saveStatus === "saving"}
              >
                Concluir
              </Button>
            </>
          )}
        </>
      )}

      <UserChip role={role} name={name} />
    </>
  );

  return (
    <>
      <Header brand={<Brand />} left={leftSection} right={rightSection} />
      <SaveExerciseModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        pdfName={pdfName}
        pdfBytes={pdfBytes}
        fields={fields}
        onSaved={(id) => {
          toast(`Exercício salvo! ID: ${id}`, "success");
          setSaveModalOpen(false);
        }}
      />
    </>
  );
}
