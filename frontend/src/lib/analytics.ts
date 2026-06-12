/**
 * Analytics de funil — provider-agnóstico (GTM-ready).
 * Os eventos vão para `window.dataLayer`; sem GTM configurado é no-op.
 */

export type FunnelEvent =
  | "editor_opened"          // visitante clicou para abrir o editor
  | "editor_pdf_loaded"      // PDF carregado no editor
  | "editor_exported"        // PDF exportado (design ou preenchido)
  | "draft_saved"            // rascunho salvo (modo anônimo)
  | "draft_limit_reached"    // anônimo bateu no limite de rascunhos
  | "signup_cta_clicked";    // clique em CTA de criar conta

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: FunnelEvent, props?: Record<string, string | number>): void {
  if (typeof window === "undefined") return;
  window.dataLayer?.push({ event, ...props });
}
