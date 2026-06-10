// Classes reutilizadas nos painéis laterais do editor

export const asideClass = "w-56 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-full";

export const asideRightClass = "w-56 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 h-full";

export const headerClass = "px-[14px] py-3 border-b border-slate-200 flex-shrink-0";

export const headerFillClass = "px-[14px] py-3 border-b border-slate-200 flex-shrink-0 bg-emerald-50";

export const propInputClass = "ui-input font-[inherit]";

export function fillInputClass(filled: boolean, multiline: boolean) {
  return [
    "ui-input font-[inherit]",
    filled && "border-[1.5px] border-emerald-500",
    multiline && "resize-y",
  ]
    .filter(Boolean)
    .join(" ");
}
