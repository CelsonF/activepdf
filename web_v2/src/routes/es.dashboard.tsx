import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/es/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/tool" });
  },
});