export { EditorShell } from "./components/EditorShell";
export { EditorScreen } from "./components/EditorScreen";
export { useEditor } from "./store";
export type { EditorState } from "./store";
export { EditorPersistenceProvider, useEditorPersistence } from "./persistence/context";
export { createApiPersistence } from "./persistence/api";
export {
  createLocalPersistence,
  readLocalDraft,
  draftFingerprint,
  ANON_DRAFT_LIMIT,
} from "./persistence/local";
export { createDocumentsPersistence } from "./persistence/apiDocuments";
export { PlanLimitError } from "./persistence/errors";
export type {
  EditorPersistence,
  PersistenceMode,
  AnswerStatus,
  LoadedExercise,
  SaveExerciseInput,
  StudentOption,
} from "./persistence/types";
export { loadPdfDocument } from "./lib/loadPdfDocument";
export { useLoadPdfFile } from "./hooks/useLoadPdfFile";
