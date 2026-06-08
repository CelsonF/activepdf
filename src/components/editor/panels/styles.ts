import type React from "react";

export const asideStyle: React.CSSProperties = {
  width: 224,
  background: "white",
  borderRight: "1px solid var(--border)",
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  height: "100%",
};

export function headerStyle(bg = "white"): React.CSSProperties {
  return {
    padding: "12px 14px",
    borderBottom: "1px solid var(--border)",
    background: bg,
    flexShrink: 0,
  };
}

export const propInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 9px",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--text-primary)",
  background: "white",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export const deleteBtnStyle: React.CSSProperties = {
  padding: "3px 6px",
  borderRadius: 5,
  fontSize: 10,
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#b91c1c",
  cursor: "pointer",
  flexShrink: 0,
  transition: "all 0.12s",
  lineHeight: 1,
};

export function fillInputStyle(filled: boolean, multiline: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "6px 9px",
    border: filled ? "1.5px solid #10b981" : "1px solid var(--border)",
    borderRadius: 6,
    fontSize: 12,
    color: "var(--text-primary)",
    background: "white",
    outline: "none",
    resize: multiline ? "vertical" : undefined,
    fontFamily: "inherit",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };
}
