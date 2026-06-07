"use client";
import type React from "react";

export function Divider() {
  return <div style={{ width: 1, height: 22, background: "#e2e8f0", flexShrink: 0 }} />;
}

export function GhostBtn({ onClick, title, children }: { onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{ padding: "4px 9px", borderRadius: 7, border: "1px solid #e2e8f0", background: "none", cursor: "pointer", color: "#475569", fontSize: 12, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 5, transition: "all 0.15s", whiteSpace: "nowrap" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {children}
    </button>
  );
}

export function PrimaryBtn({ onClick, color, shadow, hoverColor, children }: { onClick: () => void; color: string; shadow: string; hoverColor: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{ background: color, color: "white", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: `0 2px 6px ${shadow}`, transition: "all 0.15s", whiteSpace: "nowrap" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverColor)}
      onMouseLeave={(e) => (e.currentTarget.style.background = color)}
    >
      {children}
    </button>
  );
}

export function ModeBtn({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 9px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
        border: "none",
        background: active ? "white" : "transparent",
        color: active ? "var(--brand)" : "#64748b",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
        transition: "all 0.15s", whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export function TypeBtn({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
        padding: "4px 6px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
        border: "none",
        background: active ? "white" : "transparent",
        color: active ? "var(--brand)" : "#64748b",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
        transition: "all 0.15s", whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export function PageNavBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid #e2e8f0", background: "none", cursor: disabled ? "default" : "pointer", color: disabled ? "#cbd5e1" : "#475569", display: "inline-flex", alignItems: "center", transition: "all 0.15s" }}
    >
      {children}
    </button>
  );
}
