"use client";
import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "success";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  style,
  children,
  ...props
}: ButtonProps) {
  const spinnerSize = size === "xs" || size === "sm" ? 12 : size === "lg" ? 18 : 14;

  return (
    <button
      className={`ui-btn ui-btn-${variant} ui-btn-${size}${fullWidth ? " w-full" : ""}${className ? " " + className : ""}`}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {loading ? (
        <div
          className="ui-spinner"
          style={{ width: spinnerSize, height: spinnerSize, borderWidth: 2 }}
        />
      ) : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}
