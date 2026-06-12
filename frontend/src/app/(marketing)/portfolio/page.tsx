import { InspectProvider } from "@/components/portfolio/inspect";
import { Header } from "@/components/portfolio/Header";
import { Hero } from "@/components/portfolio/Hero";
import { WorkList } from "@/components/portfolio/WorkList";
import { Process } from "@/components/portfolio/Process";
import { TokenStrip } from "@/components/portfolio/TokenStrip";
import { About } from "@/components/portfolio/About";
import { Footer } from "@/components/portfolio/Footer";

export default function PortfolioPage() {
  return (
    <InspectProvider>
      <main className="min-h-screen bg-pf-canvas font-sans text-pf-ink antialiased">
        <Header />
        <Hero />
        <WorkList />
        <Process />
        <TokenStrip />
        <About />
        <Footer />
      </main>
    </InspectProvider>
  );
}
