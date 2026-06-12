import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { EditorShell } from "@/features/editor";

export default async function NewDocumentPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/dashboard");

  return (
    <EditorShell
      session={{ role: session.role, name: session.name ?? "Aluno" }}
      canDesign
      target="documents"
    />
  );
}
