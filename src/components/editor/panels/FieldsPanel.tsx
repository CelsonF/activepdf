"use client";
import { X } from "@phosphor-icons/react";
import { useEditor } from "@/store";
import { asideClass, headerClass, headerFillClass, fillInputClass } from "./styles";
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
      <aside className={asideClass}>
        <div className={headerFillClass}>
          <h3 className="text-xs font-bold text-emerald-900">Preenchimento</h3>
          <p className="text-[11px] text-emerald-700 mt-[3px] leading-[1.4]">
            Preencha os campos ou clique no PDF.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 px-[10px]">
          {fields.length === 0 ? (
            <EmptyState message="Nenhum campo definido." hint="Vá para Editar campos para criar campos." />
          ) : (
            <>
              {pageFields.length > 0 && (
                <>
                  <SectionLabel className="text-emerald-600">
                    Página {currentPage} <Muted>({pageFields.length})</Muted>
                  </SectionLabel>
                  {pageFields.map((f) => {
                    const val = fieldValues[f.id] ?? "";
                    return (
                      <div key={f.id} className="mb-[10px]">
                        {f.fieldType === "question" && (
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            {f.label || f.name}
                            {f.label && <span className="font-normal text-slate-400"> ({f.name})</span>}
                          </label>
                        )}
                        {f.multiline ? (
                          <textarea
                            value={val}
                            onChange={(e) => setFieldValue(f.id, e.target.value)}
                            rows={3}
                            className={fillInputClass(!!val, true)}
                          />
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => setFieldValue(f.id, e.target.value)}
                            className={fillInputClass(!!val, false)}
                          />
                        )}
                      </div>
                    );
                  })}
                </>
              )}
              {otherFields.length > 0 && (
                <>
                  <SectionLabel className="text-slate-400" borderTop>
                    Outras páginas <Muted>({otherFields.length})</Muted>
                  </SectionLabel>
                  {pages.filter((p) => p !== currentPage).map((p) => (
                    <div key={p} className="text-[11px] text-slate-400 px-1 py-[3px]">
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
    <aside className={asideClass}>
      <div className={headerClass}>
        <h3 className="text-xs font-bold text-slate-900">Campos</h3>
        <p className="text-[11px] text-slate-500 mt-[3px] leading-[1.4]">
          Arraste sobre o PDF para criar.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 px-[10px]">
        {fields.length === 0 ? (
          <EmptyState
            message="Nenhum campo ainda."
            hint="Arraste sobre um espaço em branco do PDF."
            icon={<FieldIcon />}
          />
        ) : (
          pages.map((p) => (
            <div key={p}>
              {pages.length > 1 && (
                <SectionLabel className="text-slate-400">
                  {p === currentPage ? "Esta página" : `Página ${p}`}{" "}
                  <Muted>({byPage[p].length})</Muted>
                </SectionLabel>
              )}
              {byPage[p].map((f) => {
                const isSelected = f.id === selectedFieldId;
                return (
                  <div
                    key={f.id}
                    className="ui-field-item"
                    data-selected={isSelected ? "true" : "false"}
                    onClick={() => selectField(f.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap">
                        {f.name}
                        {f.label && (
                          <span className="font-normal text-slate-400">
                            {" "}— {f.label}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {Math.round(f.pdfW)}×{Math.round(f.pdfH)}pt · {f.fontSize}pt
                        {f.multiline ? " · ML" : ""}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteField(f.id); }}
                      className="ui-btn ui-btn-danger px-[4px] py-[3px] flex-shrink-0"
                    >
                      <X size={11} weight="bold" />
                    </button>
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
