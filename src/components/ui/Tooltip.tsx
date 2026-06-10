"use client";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/cn";

export const TooltipProvider = RadixTooltip.Provider;
export const TooltipRoot = RadixTooltip.Root;
export const TooltipTrigger = RadixTooltip.Trigger;

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
  side?: RadixTooltip.TooltipContentProps["side"];
  sideOffset?: number;
}

export function TooltipContent({
  children,
  className,
  side = "top",
  sideOffset = 6,
}: TooltipContentProps) {
  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        side={side}
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-md",
          "data-[state=delayed-open]:animate-fadeUp",
          className
        )}
      >
        {children}
        <RadixTooltip.Arrow className="fill-slate-900" />
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  );
}

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: RadixTooltip.TooltipContentProps["side"];
  delayDuration?: number;
}

export function Tooltip({ content, children, side, delayDuration = 400 }: TooltipProps) {
  return (
    <TooltipRoot delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </TooltipRoot>
  );
}
