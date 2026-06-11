import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./portfolio.css";

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
  title: "Lina Maré — Product & Interface Designer",
  description:
    "Portfolio of Lina Maré, product and interface designer. Interfaces measured to the pixel — turn on inspect mode and see for yourself.",
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${mono.variable}`}>{children}</div>;
}
