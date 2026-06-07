import type React from "react";

export function PropField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 10, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.3px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function SectionLabel({ color, borderTop, children }: { color: string; borderTop?: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.5px",
      padding: "6px 4px 5px",
      marginTop: borderTop ? 8 : 2,
      borderTop: borderTop ? "1px solid #f1f5f9" : undefined,
    }}>
      {children}
    </div>
  );
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <span style={{ fontWeight: 400, color: "#94a3b8" }}>{children}</span>;
}

export function EmptyState({ message, hint, icon }: { message: string; hint: string; icon?: React.ReactNode }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 12px", color: "#94a3b8" }}>
      {icon && <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}>{icon}</div>}
      <div style={{ fontSize: 12, fontWeight: 500 }}>{message}</div>
      <div style={{ fontSize: 11, marginTop: 4 }}>{hint}</div>
    </div>
  );
}

export function FieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

export function PropsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  );
}
