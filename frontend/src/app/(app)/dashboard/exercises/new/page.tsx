import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { EditorShell } from "@/features/editor";

interface Profile {
  role: string;
  isAutodidact?: boolean;
}

export default async function NewExercisePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Professores e alunos autodidatas criam exercícios com campos
  let canDesign = session.role === "teacher";
  if (!canDesign) {
    try {
      const profile = await serverFetch<Profile>("/api/profile");
      canDesign = profile.isAutodidact === true;
    } catch {
      canDesign = false;
    }
  }
  if (!canDesign) redirect("/dashboard");

  return (
    <EditorShell
      session={{
        role: session.role,
        name: session.name ?? (session.role === "teacher" ? "Professor" : "Aluno"),
      }}
      canDesign
    />
  );
}
