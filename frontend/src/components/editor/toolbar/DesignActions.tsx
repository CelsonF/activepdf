"use client";
import {
  ArrowCounterClockwise, DownloadSimple, FloppyDisk, Trash,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useEditor } from "@/store";
import { exportPDF } from "@/lib/export";
import { toast } from "../Toast";

interface DesignActionsProps {
  onSaveExercise: () => void;
}

export function DesignActions({ onSaveExercise }: DesignActionsProps) {
  const {
    pdfDoc, pdfBytes, pdfName, currentPage,
    fields, exportMode, resetPdf, clearPageFields,
  } = useEditor();

  async function handleExportDesign() {
    if (!fields.length) { toast("Adicione pelo menos um campo antes de exportar", "error"); return; }
    if (!pdfBytes || !pdfDoc) { toast("PDF não disponível. Carregue novamente.", "error"); return; }
    try {
      const msg = await exportPDF(exportMode, pdfBytes, pdfDoc, fields, pdfName, (s) => toast(s));
      toast(msg, "success");
    } catch (e: unknown) {
      toast("Erro ao exportar: " + (e instanceof Error ? e.message : String(e)), "error");
    }
  }

  return (
    <>
      {fields.length > 0 && (
        <span className="text-[11px] text-slate-400 font-medium">{fields.length} campo{fields.length !== 1 ? "s" : ""}</span>
      )}
      <Tooltip content="Apagar campos desta página">
        <Button variant="ghost" size="sm" icon={<Trash size={13} />}
          onClick={() => {
            const n = fields.filter((f) => f.page === currentPage).length;
            if (!n) { toast("Esta página já não tem campos", "error"); return; }
            if (confirm(`Apagar todos os ${n} campos desta página?`)) clearPageFields(currentPage);
          }}
        >Limpar</Button>
      </Tooltip>
      <Tooltip content="Carregar novo PDF">
        <Button variant="ghost" size="sm" icon={<ArrowCounterClockwise size={13} />}
          onClick={() => { if (confirm("Voltar ao início? Os campos serão perdidos.")) resetPdf(); }}
        >Novo</Button>
      </Tooltip>
      {fields.length > 0 && (
        <Tooltip content="Salvar este PDF com os campos como exercício para um aluno">
          <Button
            variant="outline"
            size="sm"
            icon={<FloppyDisk size={13} weight="bold" />}
            onClick={onSaveExercise}
          >
            Salvar exercício
          </Button>
        </Tooltip>
      )}
      <Button variant="primary" size="sm" icon={<DownloadSimple size={13} weight="bold" />} onClick={handleExportDesign}>
        Exportar PDF
      </Button>
    </>
  );
}
