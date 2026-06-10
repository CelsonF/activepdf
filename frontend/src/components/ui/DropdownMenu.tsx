"use client";
import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/cn";

export const DropdownMenuRoot = RadixDropdown.Root;
export const DropdownMenuTrigger = RadixDropdown.Trigger;
export const DropdownMenuSub = RadixDropdown.Sub;
export const DropdownMenuSubTrigger = RadixDropdown.SubTrigger;
export const DropdownMenuSubContent = RadixDropdown.SubContent;

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: RadixDropdown.DropdownMenuContentProps["align"];
  sideOffset?: number;
}

export function DropdownMenuContent({
  children,
  className,
  align = "end",
  sideOffset = 6,
}: DropdownMenuContentProps) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[160px] bg-white border border-slate-200 rounded-xl shadow-lg p-1",
          "data-[state=open]:animate-fadeUp",
          className
        )}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
  destructive?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function DropdownMenuItem({
  children,
  onSelect,
  className,
  destructive = false,
  icon,
  disabled = false,
}: DropdownMenuItemProps) {
  return (
    <RadixDropdown.Item
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        "ui-menu-item flex items-center gap-2 text-sm rounded-lg px-2.5 py-1.5 cursor-pointer outline-none select-none",
        destructive
          ? "text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700"
          : "text-slate-700 data-[highlighted]:bg-brand-light data-[highlighted]:text-brand",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </RadixDropdown.Item>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return (
    <RadixDropdown.Separator
      className={cn("ui-divider my-1", className)}
    />
  );
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <RadixDropdown.Label
      className={cn("px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide", className)}
    >
      {children}
    </RadixDropdown.Label>
  );
}
