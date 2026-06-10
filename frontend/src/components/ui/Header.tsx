"use client";
import React from "react";

interface HeaderProps {
  brand?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Header({ brand, left, right, height = 52, className = "", style }: HeaderProps) {
  return (
    <header
      className={`bg-white border-b border-slate-200 flex items-center gap-2 px-[14px] shrink-0 z-10 shadow-[0_1px_0_rgba(0,0,0,0.04)] ${className}`}
      style={{ minHeight: height, ...style }}
    >
      {brand && (
        <div className="flex items-center gap-1.5 shrink-0">{brand}</div>
      )}
      {left && (
        <>
          <div className="ui-divider" />
          <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">{left}</div>
        </>
      )}
      {right && (
        <>
          <div className="flex-1 min-w-[8px]" />
          <div className="flex items-center gap-1.5 shrink-0">{right}</div>
        </>
      )}
    </header>
  );
}
