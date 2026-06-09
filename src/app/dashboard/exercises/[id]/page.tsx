import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ExerciseLoader } from "./ExerciseLoader";

export default async function ExercisePlayerPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <ExerciseLoader
      id={params.id}
      role={session.role}
      name={session.name ?? ""}
    />
  );
}
