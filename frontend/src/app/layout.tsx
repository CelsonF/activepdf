import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/Tooltip";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const mono = Spline_Sans_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Grifo — transforme qualquer PDF em exercício interativo",
  description:
    "Envie uma folha de atividade em PDF, crie lacunas por cima e pratique inglês direto no navegador. Marque, pratique, aprenda.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
