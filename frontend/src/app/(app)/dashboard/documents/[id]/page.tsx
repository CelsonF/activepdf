import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DocumentLoader } from "./DocumentLoader";

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/dashboard");

  return (
    <DocumentLoader
      id={params.id}
      name={session.name ?? "Aluno"}
    />
  );
}
