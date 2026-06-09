"use client";
import React from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "brand" | "success" | "warning" | "error" | "neutral";
export type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", size = "sm", icon, children, className = "" }: BadgeProps) {
  return (
    <span className={cn(`ui-badge ui-badge-${size} ui-badge-${variant}`, className)}>
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </span>
  );
}
