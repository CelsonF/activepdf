import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-pfmono",
});

export const metadata: Metadata = {
  title: "ActivePDF — Transforme qualquer PDF em prática de inglês",
  description:
    "Suba sua apostila, responda exercícios sobre a própria página e mantenha o ritmo com XP, streaks e rankings — para alunos, professores e times.",
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${mono.variable}`}>{children}</div>;
}
