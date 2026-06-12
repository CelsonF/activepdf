"use client";
import { Trash } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useEditor } from "@/features/editor/store";
import { TypeBtn } from "@/components/ui/Buttons";
import { asideRightClass, headerClass, propInputClass } from "./styles";
import { EmptyState, PropField, PropsIcon } from "./helpers";

export function PropertiesPanel() {
  const {
    fields, selectedFieldId, updateField, deleteField,
    appMode, pageViewport, pageViewSize,
  } = useEditor();

  if (appMode !== "design") return null;

  const selected = fields.find((f) => f.id === selectedFieldId) ?? null;

  return (
    <aside className={asideRightClass}>
      <div className={headerClass}>
        <h3 className="text-xs font-bold text-slate-900">Propriedades</h3>
        <p className="text-[11px] text-slate-500 mt-[3px] leading-[1.4]">
          {selected ? "Edite o campo selecionado." : "Selecione um campo."}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-[14px] py-3">
        {!selected ? (
          <EmptyState
            message="Nenhum campo selecionado."
            hint="Clique em um campo na lista ou no PDF."
            icon={<PropsIcon />}
          />
        ) : (
          <div className="flex flex-col gap-3">

            <PropField label="Tipo de campo">
              <div className="flex bg-slate-100 rounded-lg p-[3px] gap-0.5">
                <TypeBtn
                  active={selected.fieldType !== "question"}
                  onClick={() => updateField(selected.id, { fieldType: "input" })}
                  title="Campo de texto simples, sem pergunta"
                >
                  Texto simples
                </TypeBtn>
                <TypeBtn
                  active={selected.fieldType === "question"}
                  onClick={() => updateField(selected.id, { fieldType: "question" })}
                  title="Campo com pergunta/rótulo visível ao preencher"
                >
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
                className={propInputClass}
              />
            </PropField>

            {selected.fieldType === "question" && (
              <PropField label="Pergunta / Rótulo">
                <textarea
                  value={selected.label}
                  rows={3}
                  placeholder="Ex: Traduza a frase 1"
                  onChange={(e) => updateField(selected.id, { label: e.target.value })}
                  className={cn(propInputClass, "resize-y min-h-[60px]")}
                />
              </PropField>
            )}

            <PropField label="Tamanho da fonte (pt)">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={6}
                  max={72}
                  value={selected.fontSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 6 && val <= 72) updateField(selected.id, { fontSize: val });
                  }}
                  className={cn(propInputClass, "w-16 text-center")}
                />
                <div className="flex gap-[3px]">
                  {[9, 11, 14, 18].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => updateField(selected.id, { fontSize: sz })}
                      className={cn(
                        "px-[7px] py-1 rounded-[5px] text-[11px] font-medium cursor-pointer transition-all duration-[120ms] border font-[inherit]",
                        selected.fontSize === sz
                          ? "border-brand bg-brand-light text-brand"
                          : "border-slate-200 bg-white text-slate-500",
                      )}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-[7px] px-[9px] py-[7px] border border-dashed border-slate-200 rounded-[6px] bg-slate-50 text-slate-700 leading-[1.4] overflow-hidden min-h-[28px]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif", fontSize: selected.fontSize }}
              >
                Texto de exemplo
              </div>
            </PropField>

            <div className="grid grid-cols-2 gap-2">
              <PropField label="Largura (pt)">
                <input
                  type="number"
                  min={10}
                  max={600}
                  value={Math.round(selected.pdfW)}
                  onChange={(e) => {
                    const pdfW = parseInt(e.target.value, 10);
                    if (!isNaN(pdfW) && pdfW >= 10 && pageViewport && pageViewSize) {
                      const pw = Math.round((pdfW * pageViewport.width) / pageViewSize.width);
                      updateField(selected.id, { pdfW, pw });
                    }
                  }}
                  className={cn(propInputClass, "text-center")}
                />
              </PropField>
              <PropField label="Altura (pt)">
                <input
                  type="number"
                  min={6}
                  max={800}
                  value={Math.round(selected.pdfH)}
                  onChange={(e) => {
                    const pdfH = parseInt(e.target.value, 10);
                    if (!isNaN(pdfH) && pdfH >= 6 && pageViewport && pageViewSize) {
                      const ph = Math.round((pdfH * pageViewport.height) / pageViewSize.height);
                      updateField(selected.id, { pdfH, ph, multiline: ph > 30 });
                    }
                  }}
                  className={cn(propInputClass, "text-center")}
                />
              </PropField>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer pt-0.5">
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
                className="w-[14px] h-[14px] cursor-pointer accent-brand"
              />
              Multilinha
            </label>

            <button
              onClick={() => deleteField(selected.id)}
              className="ui-btn ui-btn-danger ui-btn-sm w-full mt-1"
            >
              <Trash size={13} />
              Apagar campo
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
