"use client";
import { useEditor } from "@/store";
import { exportPDF, exportFilledPDF } from "@/lib/export";
import { toast } from "./Toast";
import { Divider, GhostBtn, PrimaryBtn, ModeBtn } from "@/components/ui/Buttons";
import type { ExportMode } from "@/types";

const EXPORT_MODES: { mode: ExportMode; icon: string; label: string; title: string }[] = [
  { mode: "interactive", icon: "📋", label: "Interativo",   title: "PDF original + campos AcroForm preenchíveis" },
  { mode: "watermark",   icon: "💧", label: "Marca d'água", title: "Original apagado no fundo + campos proeminentes" },
  { mode: "answers",     icon: "📝", label: "Só respostas", title: "Folha limpa apenas com campos de resposta" },
];

export function Toolbar() {
  const {
    pdfDoc, pdfBytes, pdfName, currentPage,
    fields, fieldValues, exportMode, appMode,
    ocrOpen,
    setExportMode, resetPdf, clearPageFields,
    setAppMode, clearFieldValues, setOcrOpen,
  } = useEditor();

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

  return (
    <header style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 12px", minHeight: 50, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flexShrink: 0, zIndex: 10, boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}>

      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 2 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", letterSpacing: "-0.2px", whiteSpace: "nowrap" }}>ActivePDF</span>
      </div>

      <Divider />

      {/* Mode toggle */}
      <div style={{ display: "flex", alignItems: "center", background: "#f1f5f9", borderRadius: 9, padding: 3, gap: 2 }}>
        <ModeBtn active={!isFill} onClick={() => setAppMode("design")} title="Arraste para criar campos, mova e redimensione">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Editar campos
        </ModeBtn>
        <ModeBtn active={isFill} onClick={() => setAppMode("fill")} title="Clique nos campos e escreva as respostas">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          Preencher
        </ModeBtn>
      </div>

      <Divider />

      {/* Export format selector — design mode only */}
      {!isFill && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>Exportar como:</span>
          {EXPORT_MODES.map(({ mode, icon, label, title }) => (
            <button
              key={mode}
              title={title}
              onClick={() => { setExportMode(mode); toast("Modo: " + label); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1.5px solid ${exportMode === mode ? "var(--brand)" : "#e2e8f0"}`, background: exportMode === mode ? "var(--brand-light)" : "white", color: exportMode === mode ? "var(--brand)" : "#475569", transition: "all 0.15s", whiteSpace: "nowrap" }}
            >
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Fill mode badge */}
      {isFill && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 7, padding: "3px 9px", whiteSpace: "nowrap" }}>
            ✏️ Preenchimento
          </div>
          {filledCount > 0 && (
            <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{filledCount}/{fieldCount} preenchido{filledCount !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}

      <Divider />

      {/* OCR button */}
      <button
        onClick={() => setOcrOpen(!ocrOpen)}
        title="Extrair texto das páginas com OCR"
        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${ocrOpen ? "var(--brand)" : "#e2e8f0"}`, background: ocrOpen ? "var(--brand-light)" : "white", color: ocrOpen ? "var(--brand)" : "#475569", transition: "all 0.15s", whiteSpace: "nowrap" }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        OCR
      </button>

      <div style={{ flex: 1, minWidth: 8 }} />

      {/* Design mode actions */}
      {!isFill && (
        <>
          {fieldCount > 0 && <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap" }}>{fieldCount} campo{fieldCount !== 1 ? "s" : ""}</span>}
          <GhostBtn title="Apagar campos desta página" onClick={() => {
            const n = fields.filter((f) => f.page === currentPage).length;
            if (!n) { toast("Esta página já não tem campos", "error"); return; }
            if (confirm(`Apagar todos os ${n} campos desta página?`)) clearPageFields(currentPage);
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1.4 14.1a2 2 0 0 1-2 1.9H8.4a2 2 0 0 1-2-1.9L5 6"/></svg>
            Limpar
          </GhostBtn>
          <GhostBtn title="Carregar novo PDF" onClick={() => { if (confirm("Voltar ao início? Os campos serão perdidos.")) resetPdf(); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            Novo
          </GhostBtn>
          <PrimaryBtn onClick={handleExportDesign} color="var(--brand)" shadow="rgba(79,70,229,0.35)" hoverColor="var(--brand-dark)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar PDF
          </PrimaryBtn>
        </>
      )}

      {/* Fill mode actions */}
      {isFill && (
        <>
          <GhostBtn title="Limpar todas as respostas" onClick={() => { if (confirm("Limpar todas as respostas?")) clearFieldValues(); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1.4 14.1a2 2 0 0 1-2 1.9H8.4a2 2 0 0 1-2-1.9L5 6"/></svg>
            Limpar
          </GhostBtn>
          <PrimaryBtn onClick={handleExportFilled} color="#059669" shadow="rgba(5,150,105,0.35)" hoverColor="#047857">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar
          </PrimaryBtn>
        </>
      )}
    </header>
  );
}
