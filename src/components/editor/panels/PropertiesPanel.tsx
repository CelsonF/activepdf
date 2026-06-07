"use client";
import { useEditor } from "@/store";
import { TypeBtn } from "@/components/ui/Buttons";
import { asideStyle, headerStyle, propInputStyle } from "./styles";
import { EmptyState, PropField, PropsIcon } from "./helpers";

export function PropertiesPanel() {
  const {
    fields, selectedFieldId, updateField, deleteField,
    appMode, pageViewport, pageViewSize,
  } = useEditor();

  if (appMode !== "design") return null;

  const selected = fields.find((f) => f.id === selectedFieldId) ?? null;

  return (
    <aside style={{ ...asideStyle, borderLeft: "1px solid #e2e8f0", borderRight: "none" }}>
      <div style={headerStyle()}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: 0 }}>Propriedades</h3>
        <p style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
          {selected ? "Edite o campo selecionado." : "Selecione um campo."}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
        {!selected ? (
          <EmptyState message="Nenhum campo selecionado." hint="Clique em um campo na lista ou no PDF." icon={<PropsIcon />} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            <PropField label="Tipo de campo">
              <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 3, gap: 2 }}>
                <TypeBtn
                  active={selected.fieldType !== "question"}
                  onClick={() => updateField(selected.id, { fieldType: "input" })}
                  title="Campo de texto simples, sem pergunta"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="8" rx="2"/><line x1="7" y1="12" x2="7" y2="12"/></svg>
                  Texto simples
                </TypeBtn>
                <TypeBtn
                  active={selected.fieldType === "question"}
                  onClick={() => updateField(selected.id, { fieldType: "question" })}
                  title="Campo com pergunta/rótulo visível ao preencher"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Questão
                </TypeBtn>
              </div>
            </PropField>

            <PropField label="Nome interno">
              <input
                type="text"
                value={selected.name}
                onChange={(e) => updateField(selected.id, { name: e.target.value.replace(/[^A-Za-z0-9_]/g, "_") })}
                onBlur={(e) => {
                  if (!e.target.value.trim()) updateField(selected.id, { name: `campo${selected.id.slice(0, 4)}` });
                }}
                style={propInputStyle}
              />
            </PropField>

            {selected.fieldType === "question" && (
              <PropField label="Pergunta / Rótulo">
                <textarea
                  value={selected.label}
                  rows={3}
                  placeholder="Ex: Traduza a frase 1"
                  onChange={(e) => updateField(selected.id, { label: e.target.value })}
                  style={{ ...propInputStyle, resize: "vertical", minHeight: 56 }}
                />
              </PropField>
            )}

            <PropField label="Tamanho da fonte (pt)">
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="number" min={6} max={72} value={selected.fontSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 6 && val <= 72) updateField(selected.id, { fontSize: val });
                  }}
                  style={{ ...propInputStyle, width: 72, textAlign: "center" }}
                />
                <div style={{ display: "flex", gap: 3 }}>
                  {[9, 11, 14, 18].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => updateField(selected.id, { fontSize: sz })}
                      style={{
                        padding: "3px 7px", borderRadius: 5, fontSize: 11, fontWeight: 500, cursor: "pointer",
                        border: `1px solid ${selected.fontSize === sz ? "var(--brand)" : "#e2e8f0"}`,
                        background: selected.fontSize === sz ? "var(--brand-light)" : "white",
                        color: selected.fontSize === sz ? "var(--brand)" : "#64748b",
                        transition: "all 0.12s",
                      }}
                    >{sz}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 6, padding: "6px 8px", border: "1px dashed #e2e8f0", borderRadius: 6, fontFamily: "Helvetica, Arial, sans-serif", fontSize: selected.fontSize, color: "#374151", lineHeight: 1.4, overflow: "hidden", minHeight: 28 }}>
                Texto de exemplo
              </div>
            </PropField>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PropField label="Largura (pt)">
                <input
                  type="number" min={10} max={600} value={Math.round(selected.pdfW)}
                  onChange={(e) => {
                    const pdfW = parseInt(e.target.value, 10);
                    if (!isNaN(pdfW) && pdfW >= 10 && pageViewport && pageViewSize) {
                      const pw = Math.round((pdfW * pageViewport.width) / pageViewSize.width);
                      updateField(selected.id, { pdfW, pw });
                    }
                  }}
                  style={{ ...propInputStyle, textAlign: "center" }}
                />
              </PropField>
              <PropField label="Altura (pt)">
                <input
                  type="number" min={6} max={800} value={Math.round(selected.pdfH)}
                  onChange={(e) => {
                    const pdfH = parseInt(e.target.value, 10);
                    if (!isNaN(pdfH) && pdfH >= 6 && pageViewport && pageViewSize) {
                      const ph = Math.round((pdfH * pageViewport.height) / pageViewSize.height);
                      updateField(selected.id, { pdfH, ph, multiline: ph > 30 });
                    }
                  }}
                  style={{ ...propInputStyle, textAlign: "center" }}
                />
              </PropField>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569", cursor: "pointer", paddingTop: 4 }}>
              <input
                type="checkbox"
                checked={selected.multiline}
                onChange={(e) => {
                  const ml = e.target.checked;
                  let ph = selected.ph, pdfH = selected.pdfH;
                  if (ml && ph < 40) {
                    ph = 50;
                    if (pageViewport && pageViewSize) pdfH = Math.round((ph * pageViewSize.height) / pageViewport.height);
                  }
                  updateField(selected.id, { multiline: ml, ph, pdfH });
                }}
                style={{ accentColor: "var(--brand)", width: 14, height: 14 }}
              />
              Multilinha
            </label>

            <button
              onClick={() => deleteField(selected.id)}
              style={{ marginTop: 4, padding: "7px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", cursor: "pointer", transition: "all 0.12s", width: "100%" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fef2f2")}
            >
              Apagar campo
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
