"use client";
import { useEditor } from "@/store";
import { asideStyle, headerStyle, fillInputStyle, deleteBtnStyle } from "./styles";
import { EmptyState, FieldIcon, Muted, SectionLabel } from "./helpers";

export function FieldsPanel() {
  const {
    fields, currentPage, selectedFieldId, appMode,
    fieldValues, setFieldValue, selectField, deleteField,
  } = useEditor();

  const isFill = appMode === "fill";
  const byPage: Record<number, typeof fields> = {};
  for (const f of fields) { (byPage[f.page] = byPage[f.page] ?? []).push(f); }
  const pages = Object.keys(byPage).map(Number).sort((a, b) => a - b);
  const pageFields = fields.filter((f) => f.page === currentPage);
  const otherFields = fields.filter((f) => f.page !== currentPage);

  if (isFill) {
    return (
      <aside style={asideStyle}>
        <div style={headerStyle("#f0fdf4")}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#065f46", margin: 0 }}>Preenchimento</h3>
          <p style={{ fontSize: 11, color: "#047857", marginTop: 3 }}>Preencha os campos ou clique no PDF.</p>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
          {fields.length === 0 ? (
            <EmptyState message="Nenhum campo definido." hint="Vá para Editar campos para criar campos." />
          ) : (
            <>
              {pageFields.length > 0 && (
                <>
                  <SectionLabel color="#059669">Página {currentPage} <Muted>({pageFields.length})</Muted></SectionLabel>
                  {pageFields.map((f) => {
                    const val = fieldValues[f.id] ?? "";
                    return (
                      <div key={f.id} style={{ marginBottom: 10 }}>
                        {f.fieldType === "question" && (
                          <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                            {f.label || f.name}
                            {f.label && <span style={{ color: "#9ca3af", fontWeight: 400 }}> ({f.name})</span>}
                          </label>
                        )}
                        {f.multiline ? (
                          <textarea
                            value={val}
                            onChange={(e) => setFieldValue(f.id, e.target.value)}
                            rows={3}
                            placeholder=""
                            style={fillInputStyle(!!val, true)}
                          />
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => setFieldValue(f.id, e.target.value)}
                            placeholder=""
                            style={fillInputStyle(!!val, false)}
                          />
                        )}
                      </div>
                    );
                  })}
                </>
              )}
              {otherFields.length > 0 && (
                <>
                  <SectionLabel color="#94a3b8" borderTop>Outras páginas <Muted>({otherFields.length})</Muted></SectionLabel>
                  {pages.filter((p) => p !== currentPage).map((p) => (
                    <div key={p} style={{ fontSize: 11, color: "#94a3b8", padding: "3px 4px" }}>
                      Pág. {p}: {byPage[p].filter((f) => fieldValues[f.id]?.trim()).length}/{byPage[p].length} preenchido(s)
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside style={asideStyle}>
      <div style={headerStyle()}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: 0 }}>Campos</h3>
        <p style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>Arraste sobre o PDF para criar.</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {fields.length === 0 ? (
          <EmptyState message="Nenhum campo ainda." hint="Arraste sobre um espaço em branco do PDF." icon={<FieldIcon />} />
        ) : (
          pages.map((p) => (
            <div key={p}>
              {pages.length > 1 && (
                <SectionLabel color="#64748b">
                  {p === currentPage ? "Esta página" : `Página ${p}`} <Muted>({byPage[p].length})</Muted>
                </SectionLabel>
              )}
              {byPage[p].map((f) => {
                const isSelected = f.id === selectedFieldId;
                return (
                  <div
                    key={f.id}
                    onClick={() => selectField(f.id)}
                    style={{
                      padding: "7px 9px", borderRadius: 7, marginBottom: 3,
                      border: `1px solid ${isSelected ? "var(--brand)" : "#e2e8f0"}`,
                      background: isSelected ? "var(--brand-light)" : "white",
                      cursor: "pointer", transition: "all 0.12s",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {f.name}
                        {f.label && <span style={{ color: "#94a3b8", fontWeight: 400 }}> — {f.label}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>
                        {Math.round(f.pdfW)}×{Math.round(f.pdfH)}pt · {f.fontSize}pt{f.multiline ? " · ML" : ""}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteField(f.id); }}
                      style={deleteBtnStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fef2f2")}
                    >✕</button>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
