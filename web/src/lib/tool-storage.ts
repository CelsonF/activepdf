export type FieldType = 'text' | 'check' | 'date' | 'number'

export interface ToolField {
  id: string
  type: FieldType
  /** página 1-based */
  page: number
  /** coordenadas normalizadas 0..1 sobre a página renderizada */
  x: number
  y: number
  fontSize: number
  label: string
  value: string
}

export interface ToolDoc {
  id: string
  name: string
  /** binário do PDF em base64 — documentos anônimos vivem no dispositivo */
  pdfBase64: string
  pageCount: number
  fields: ToolField[]
  notes: string
  updatedAt: string
}

const KEY = 'grifo:tool:docs'

export function listDocs(): ToolDoc[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ToolDoc[]) : []
  } catch {
    return []
  }
}

export function getDoc(id: string): ToolDoc | null {
  return listDocs().find((d) => d.id === id) ?? null
}

export function saveDoc(doc: ToolDoc): void {
  const docs = listDocs()
  const next = { ...doc, updatedAt: new Date().toISOString() }
  const at = docs.findIndex((d) => d.id === doc.id)
  if (at >= 0) docs[at] = next
  else docs.unshift(next)
  window.localStorage.setItem(KEY, JSON.stringify(docs))
}

/** Grava a lista inteira — usado pelo editor com debounce. */
export function saveAllDocs(docs: ToolDoc[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(docs))
}

export function deleteDoc(id: string): void {
  window.localStorage.setItem(
    KEY,
    JSON.stringify(listDocs().filter((d) => d.id !== id)),
  )
}

export function newDocId(): string {
  return crypto.randomUUID()
}
