"use client";
import { useEffect, useState } from "react";
import { FloppyDisk, BookOpen, Highlighter, Check } from "@phosphor-icons/react";
import { DialogRoot, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/Dialog";
import { Select, SelectItem } from "@/components/ui/Select";
import { useEditorPersistence } from "../persistence/context";
import { DraftLimitError } from "../persistence/local";
import type { StudentOption } from "../persistence/types";
import { track } from "@/lib/analytics";
import type { PdfField } from "@/types";

const ACCOUNT_PERKS = [
  "Salve quantas atividades quiser",
  "Reabra e continue de qualquer lugar",
  "Acompanhe seu progresso com XP",
] as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Professor atribui a um aluno; autodidata/anônimo salva para si mesmo. */
  showStudentSelect?: boolean;
  pdfName: string;
  pdfBytes: ArrayBuffer | null;
  fields: PdfField[];
  onSaved: (exerciseId: string) => void;
}

export function SaveExerciseModal({ isOpen, onClose, showStudentSelect = true, pdfName, pdfBytes, fields, onSaved }: Props) {
  const persistence = useEditorPersistence();
  const isLocal = persistence.mode === "local";

  const [title, setTitle] = useState(pdfName);
  const [studentId, setStudentId] = useState("");
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(pdfName);
    setError("");
    setLimitReached(false);
    if (!showStudentSelect) return;
    persistence
      .listStudents()
      .then(setStudents)
      .catch(() => undefined);
  }, [isOpen, pdfName, showStudentSelect, persistence]);

  async function handleSave() {
    if (!title.trim()) { setError("Informe um título para o exercício"); return; }
    if (!pdfBytes) { setError("PDF não carregado"); return; }
    setError("");
    setLoading(true);
    try {
      const { id } = await persistence.saveExercise({
        title: title.trim(),
        studentId: studentId || null,
        pdfName,
        pdfBytes,
        fields,
      });
      if (isLocal) track("draft_saved");
      onSaved(id);
      onClose();
    } catch (e: unknown) {
      if (e instanceof DraftLimitError) {
        track("draft_limit_reached");
        setLimitReached(true);
        return;
      }
      setError(e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Limite do anônimo atingido: o modal vira convite à conta gratuita
  if (limitReached) {
    return (
      <DialogRoot open={isOpen} onOpenChange={(o) => !o && onClose()}>
        <DialogContent>
          <DialogHeader
            title="Seu navegador está cheio de ideias"
            icon={<Highlighter size={14} weight="fill" className="text-brand" />}
          />
          <div className="p-5 flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-slate-600">
              O modo sem conta guarda <span className="font-semibold">1 rascunho</span> por
              navegador — e o seu já está em uso. Crie uma conta gratuita para
              continuar de onde parou.
            </p>
            <ul className="flex flex-col gap-2">
              {ACCOUNT_PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check size={15} weight="bold" className="mt-0.5 shrink-0 text-brand" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <button onClick={onClose} className="ui-btn ui-btn-ghost ui-btn-md">
              Agora não
            </button>
            <a
              href="/register"
              onClick={() => track("signup_cta_clicked", { placement: "save_limit_modal" })}
              className="ui-btn ui-btn-primary ui-btn-md"
            >
              Criar conta grátis
            </a>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    );
  }

  return (
    <DialogRoot open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader
          title={isLocal ? "Salvar rascunho" : "Salvar como exercício"}
          icon={<BookOpen size={14} weight="bold" className="text-brand" />}
        />

        <div className="p-5 flex flex-col gap-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Título do exercício <span className="text-red-500">*</span>
            </label>
            <input
              className="ui-input text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Gramática — Verbos Modais, Unidade 5"
              autoFocus
            />
          </div>

          {showStudentSelect && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Atribuir ao aluno <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <Select
                value={studentId}
                onValueChange={setStudentId}
                placeholder="Selecionar aluno..."
              >
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </Select>
              {students.length === 0 && (
                <p className="text-[11px] text-slate-400 mt-1">Nenhum aluno cadastrado ainda.</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600">
              {isLocal ? (
                <>
                  <span className="font-semibold">{fields.length}</span>{" "}
                  campo{fields.length !== 1 ? "s" : ""} serão guardados neste navegador —
                  reenvie o mesmo PDF para restaurá-los.
                </>
              ) : (
                <>
                  <span className="font-semibold">{fields.length}</span>{" "}
                  campo{fields.length !== 1 ? "s" : ""} criado{fields.length !== 1 ? "s" : ""} serão salvos para{" "}
                  {showStudentSelect ? "o aluno" : "você"} preencher.
                </>
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <button onClick={onClose} className="ui-btn ui-btn-ghost ui-btn-md">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={loading || !title.trim()}
            className="ui-btn ui-btn-primary ui-btn-md gap-1.5"
          >
            {loading
              ? <span className="ui-spinner w-3.5 h-3.5 border-2 text-white" />
              : <FloppyDisk size={14} weight="bold" />}
            {isLocal ? "Salvar rascunho" : "Salvar exercício"}
          </button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
