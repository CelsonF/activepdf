"use client";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export const DialogRoot = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fadeUp" />
      <RadixDialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden",
          "data-[state=open]:animate-fadeUp",
          className
        )}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

interface DialogHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export function DialogHeader({ title, icon }: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
      <div className="flex items-center gap-2">
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <RadixDialog.Title className="text-sm font-bold text-slate-900">
          {title}
        </RadixDialog.Title>
      </div>
      <RadixDialog.Close className="ui-btn ui-btn-ghost ui-btn-xs w-7 h-7">
        <X size={14} />
      </RadixDialog.Close>
    </div>
  );
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
      {children}
    </div>
  );
}
