"use client";
import { PencilSimple, Scan, TextAlignLeft } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Divider, ModeBtn } from "@/components/ui/Buttons";
import { Tooltip } from "@/components/ui/Tooltip";
import { useEditor } from "@/features/editor/store";
import { toast } from "../Toast";
import type { ExportMode } from "@/types";

const EXPORT_MODES: { mode: ExportMode; label: string; tooltip: string }[] = [
  { mode: "interactive", label: "Interativo",   tooltip: "PDF original + campos AcroForm preenchíveis" },
  { mode: "watermark",   label: "Marca d'água", tooltip: "Original apagado no fundo + campos proeminentes" },
  { mode: "answers",     label: "Só respostas", tooltip: "Folha limpa apenas com campos de resposta" },
];

interface ToolbarLeftProps {
  isTeacher: boolean;
}

export function ToolbarLeft({ isTeacher }: ToolbarLeftProps) {
  const {
    fields, fieldValues, exportMode, appMode, ocrOpen,
    setExportMode, setAppMode, setOcrOpen,
  } = useEditor();

  const isFill = appMode === "fill";
  const filledCount = fields.filter((f) => fieldValues[f.id]?.trim()).length;

  return (
    <>
      {isTeacher && (
        <div className="flex items-center bg-slate-100 rounded-lg p-[3px] gap-0.5">
          <Tooltip content="Arraste para criar campos, mova e redimensione" side="bottom">
            <ModeBtn active={!isFill} onClick={() => setAppMode("design")}>
              <PencilSimple size={13} weight={!isFill ? "bold" : "regular"} />
              Editar campos
            </ModeBtn>
          </Tooltip>
          <Tooltip content="Clique nos campos e escreva as respostas" side="bottom">
            <ModeBtn active={isFill} onClick={() => setAppMode("fill")}>
              <TextAlignLeft size={13} weight={isFill ? "bold" : "regular"} />
              Preencher
            </ModeBtn>
          </Tooltip>
        </div>
      )}

      {isTeacher && <Divider />}

      {isTeacher && !isFill && (
        <div className="flex items-center gap-[5px]">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Exportar como:</span>
          {EXPORT_MODES.map(({ mode, label, tooltip }) => (
            <Tooltip key={mode} content={tooltip} side="bottom">
              <button
                className="ui-export-btn"
                data-active={exportMode === mode ? "true" : "false"}
                onClick={() => { setExportMode(mode); toast("Modo: " + label); }}
              >
                {label}
              </button>
            </Tooltip>
          ))}
        </div>
      )}

      {isFill && (
        <div className="flex items-center gap-2">
          <Badge variant="brand" icon={<PencilSimple size={11} />}>Preenchimento</Badge>
          {filledCount > 0 && (
            <span className="text-xs text-slate-400">{filledCount}/{fields.length} preenchido{filledCount !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}

      {isTeacher && (
        <>
          <Divider />
          <Tooltip content="Extrair texto das páginas com OCR" side="bottom">
            <button
              className="ui-export-btn"
              data-active={ocrOpen ? "true" : "false"}
              onClick={() => setOcrOpen(!ocrOpen)}
            >
              <Scan size={14} /> OCR
            </button>
          </Tooltip>
        </>
      )}
    </>
  );
}
