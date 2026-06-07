"use client";
import { create } from "zustand";
import { useEffect } from "react";

interface ToastState {
  msg: string;
  type: "default" | "success" | "error";
  show: (msg: string, type?: "default" | "success" | "error") => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  msg: "",
  type: "default",
  show: (msg, type = "default") => set({ msg, type }),
  hide: () => set({ msg: "" }),
}));

// Global helper
let _show: ToastState["show"] | null = null;
export function toast(msg: string, type?: "default" | "success" | "error") {
  _show?.(msg, type);
}

export function Toast() {
  const { msg, type, show, hide } = useToast();
  useEffect(() => { _show = show; }, [show]);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(hide, 3500);
    return () => clearTimeout(t);
  }, [msg, hide]);

  if (!msg) return null;

  const bg = type === "success" ? "#059669" : type === "error" ? "#dc2626" : "#0f172a";

  return (
    <div className="animate-slideIn" style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: bg, color: "white",
      padding: "11px 18px", borderRadius: 10,
      fontSize: 14, fontWeight: 500,
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      maxWidth: 380,
    }}>
      {msg}
    </div>
  );
}
