"use client";

import { createContext, useContext, useState } from "react";

interface InspectContextValue {
  on: boolean;
  toggle: () => void;
}

const InspectContext = createContext<InspectContextValue | null>(null);

export function useInspect(): InspectContextValue {
  const ctx = useContext(InspectContext);
  if (!ctx) throw new Error("useInspect deve ser usado dentro de InspectProvider");
  return ctx;
}

export function InspectProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);

  return (
    <InspectContext.Provider value={{ on, toggle: () => setOn((v) => !v) }}>
      <div data-inspect={on ? "on" : "off"} className="relative">
        {/* Grade de colunas + baseline visível apenas em inspect mode */}
        <div
          aria-hidden
          className="pf-grid-overlay pointer-events-none fixed inset-0 z-40"
        >
          <div className="pf-grid-columns mx-auto h-full max-w-6xl px-6" />
        </div>
        {children}
      </div>
    </InspectContext.Provider>
  );
}
