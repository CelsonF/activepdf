import React from "react";
import { CursorText, SlidersHorizontal } from "@phosphor-icons/react";

export function PropField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          fontWeight: 700,
          display: "block",
          marginBottom: 5,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function SectionLabel({
  color,
  borderTop,
  children,
}: {
  color: string;
  borderTop?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        padding: "6px 4px 5px",
        marginTop: borderTop ? 8 : 2,
        borderTop: borderTop ? "1px solid var(--border)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>{children}</span>;
}

export function EmptyState({
  message,
  hint,
  icon,
}: {
  message: string;
  hint: string;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ textAlign: "center", padding: "36px 12px", color: "var(--text-muted)" }}>
      {icon && (
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", opacity: 0.4 }}>
          {icon}
        </div>
      )}
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{message}</div>
      <div style={{ fontSize: 11, marginTop: 5, lineHeight: 1.5 }}>{hint}</div>
    </div>
  );
}

export function FieldIcon() {
  return <CursorText size={32} color="#cbd5e1" />;
}

export function PropsIcon() {
  return <SlidersHorizontal size={32} color="#cbd5e1" />;
}
