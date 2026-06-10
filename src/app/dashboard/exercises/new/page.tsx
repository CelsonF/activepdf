import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/editor/AppShell";

export default async function NewExercisePage() {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/dashboard");

  return (
    <AppShell
      role={session.role as "teacher"}
      name={session.name ?? "Professor"}
    />
  );
}
