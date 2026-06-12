import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { serverFetch } from "@/lib/api";
import { AppShell } from "@/components/editor/AppShell";

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
    <AppShell
      role={session.role}
      name={session.name ?? (session.role === "teacher" ? "Professor" : "Aluno")}
      canDesign
    />
  );
}
