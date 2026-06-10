"use client";
import React from "react";

export function Divider() {
  return <div className="ui-divider" />;
}

export function GhostBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button className="ui-btn ui-btn-ghost ui-btn-sm" onClick={onClick} title={title}>
      {children}
    </button>
  );
}

export function PrimaryBtn({
  onClick,
  color,
  shadow,
  hoverColor,
  children,
}: {
  onClick: () => void;
  color: string;
  shadow: string;
  hoverColor: string;
  children: React.ReactNode;
}) {
  const isSuccess = color.includes("059669") || color.includes("047857");
  return (
    <button
      className={`ui-btn ui-btn-${isSuccess ? "success" : "primary"} ui-btn-sm`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function ModeBtn({
  active,
  onClick,
  children,
  ...props
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">) {
  return (
    <button
      className="ui-btn-mode"
      onClick={onClick}
      data-active={active ? "true" : "false"}
      {...props}
    >
      {children}
    </button>
  );
}

export function TypeBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className="ui-btn-mode"
      onClick={onClick}
      title={title}
      data-active={active ? "true" : "false"}
      style={{ flex: 1, justifyContent: "center" }}
    >
      {children}
    </button>
  );
}

export function PageNavBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button className="ui-btn-page-nav" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
