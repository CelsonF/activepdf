"use client";

import { cn } from "@/lib/cn";
import { useReveal } from "@/hooks/useReveal";

interface RevealSectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

/** Seção que revela no scroll todos os descendentes marcados com data-reveal. */
export function RevealSection({ children, id, className }: RevealSectionProps) {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} id={id} className={cn("relative", className)}>
      {children}
    </section>
  );
}
