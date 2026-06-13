import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing-page";
import { buildLandingHead } from "@/lib/route-heads";

export const Route = createFileRoute("/es")({
  head: () => buildLandingHead("es"),
  component: () => <LandingPage locale="es" />,
});