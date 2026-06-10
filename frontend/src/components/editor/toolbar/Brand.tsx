import { FilePdf } from "@phosphor-icons/react";

export function Brand() {
  return (
    <div className="flex items-center gap-[7px]">
      <div className="w-[30px] h-[30px] rounded-lg bg-brand flex items-center justify-center shrink-0 shadow-brand">
        <FilePdf size={16} weight="bold" className="text-white" />
      </div>
      <span className="font-extrabold text-[15px] text-slate-900 tracking-[-0.3px] whitespace-nowrap">
        ActivePDF
      </span>
    </div>
  );
}
