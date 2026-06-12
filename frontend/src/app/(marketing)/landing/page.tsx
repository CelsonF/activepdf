import { redirect } from "next/navigation";

/** Rota legada: a capa agora é a raiz. */
export default function LegacyLandingPage() {
  redirect("/");
}
