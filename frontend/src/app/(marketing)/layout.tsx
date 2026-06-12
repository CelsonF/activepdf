import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

const pfmono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-pfmono",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Grifo — Transforme qualquer PDF em atividade interativa",
    template: "%s — Grifo",
  },
  description:
    "Solte sua apostila, crie campos sobre a própria página, responda e exporte o PDF preenchido — direto no navegador, sem cadastro. Professores criam turmas, corrigem e acompanham com XP.",
  openGraph: {
    type: "website",
    siteName: "Grifo",
    locale: "pt_BR",
    title: "Grifo — Transforme qualquer PDF em atividade interativa",
    description:
      "Marque, pratique, aprenda. O editor que transforma PDFs em exercícios interativos — grátis, direto no navegador.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grifo — Transforme qualquer PDF em atividade interativa",
    description:
      "Marque, pratique, aprenda. O editor que transforma PDFs em exercícios interativos — grátis, direto no navegador.",
  },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={pfmono.variable}>{children}</div>;
}
