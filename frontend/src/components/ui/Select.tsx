"use client";
import * as RadixSelect from "@radix-ui/react-select";
import { CaretDown, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export const SelectRoot = RadixSelect.Root;
export const SelectGroup = RadixSelect.Group;
export const SelectValue = RadixSelect.Value;

interface SelectTriggerProps {
  placeholder?: string;
  className?: string;
}

export function SelectTrigger({ placeholder, className }: SelectTriggerProps) {
  return (
    <RadixSelect.Trigger
      className={cn(
        "ui-input text-sm flex items-center justify-between gap-2 w-full cursor-pointer",
        className
      )}
    >
      <RadixSelect.Value placeholder={placeholder} />
      <RadixSelect.Icon>
        <CaretDown size={14} className="text-slate-400 shrink-0" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className }: SelectContentProps) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        position="popper"
        sideOffset={4}
        className={cn(
          "z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden",
          "w-[--radix-select-trigger-width]",
          "data-[state=open]:animate-fadeUp",
          className
        )}
      >
        <RadixSelect.Viewport className="p-1">
          {children}
        </RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  return (
    <RadixSelect.Item
      value={value}
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-700",
        "cursor-pointer outline-none select-none",
        "data-[highlighted]:bg-brand-light data-[highlighted]:text-brand",
        className
      )}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator>
        <Check size={12} weight="bold" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, placeholder, children }: SelectProps) {
  return (
    <SelectRoot value={value} onValueChange={onValueChange}>
      <SelectTrigger placeholder={placeholder} />
      <SelectContent>{children}</SelectContent>
    </SelectRoot>
  );
}
