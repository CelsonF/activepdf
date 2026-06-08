import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/editor/AppShell";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AppShell role={session.role} name={session.name} />;
}
