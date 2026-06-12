"use client";
import { create } from "zustand";
import { useEffect } from "react";
import { cn } from "@/lib/cn";

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

  return (
    <div className={cn(
      "animate-slideIn fixed top-5 right-5 z-[9999] text-white px-[18px] py-[11px] rounded-[10px]",
      "text-sm font-medium shadow-[0_10px_30px_rgba(0,0,0,0.2)] max-w-[380px]",
      type === "success" ? "bg-emerald-600" : type === "error" ? "bg-red-600" : "bg-slate-900",
    )}>
      {msg}
    </div>
  );
}
