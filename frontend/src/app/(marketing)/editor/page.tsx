import type { Metadata } from "next";
import { EditorShell } from "@/features/editor";

export const metadata: Metadata = {
  title: "Editor de PDF — Grifo",
  description:
    "Transforme qualquer PDF em atividade interativa: crie campos, preencha e exporte — direto no navegador, sem cadastro.",
};

/** Editor anônimo: 100% client-side, nenhum dado sai do navegador. */
export default function EditorPage() {
  return <EditorShell session={null} />;
}
