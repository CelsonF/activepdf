import type React from "react";

export const asideStyle: React.CSSProperties = {
  width: 220,
  background: "white",
  borderRight: "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  height: "100%",
};

export function headerStyle(bg = "white"): React.CSSProperties {
  return { padding: "10px 12px", borderBottom: "1px solid #e2e8f0", background: bg, flexShrink: 0 };
}

export const propInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "5px 8px",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  fontSize: 12,
  color: "#0f172a",
  background: "white",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

export const deleteBtnStyle: React.CSSProperties = {
  padding: "2px 5px",
  borderRadius: 5,
  fontSize: 10,
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#b91c1c",
  cursor: "pointer",
  flexShrink: 0,
  transition: "all 0.12s",
};

export function fillInputStyle(filled: boolean, multiline: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "5px 7px",
    border: filled ? "1.5px solid #10b981" : "1px solid #e2e8f0",
    borderRadius: 6,
    fontSize: 12,
    color: "#0f172a",
    background: "white",
    outline: "none",
    resize: multiline ? "vertical" : undefined,
    fontFamily: "inherit",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };
}
