"use client";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, Building, Camera } from "@phosphor-icons/react";

interface TeacherOrgStepProps {
  accountName: string;
  orgName: string;
  onOrgName: (v: string) => void;
  logoPreview: string | null;
  onLogoFile: (file: File) => void;
  canSubmit: boolean;
  loading: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function TeacherOrgStep({
  accountName, orgName, onOrgName, logoPreview, onLogoFile, canSubmit, loading, onBack, onSubmit,
}: TeacherOrgStepProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Sua escola</h1>
      <p className="text-sm text-slate-500 mb-6">
        Configure o perfil da sua organização. Os alunos verão este nome e logo.
      </p>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative shrink-0">
          <div
            className="w-16 h-16 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building size={24} className="text-slate-300" weight="bold" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shadow-sm hover:bg-brand-dark"
          >
            <Camera size={11} weight="bold" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onLogoFile(file);
            }}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Logo da escola</p>
          <p className="text-xs text-slate-400 mt-0.5">Clique para fazer upload (opcional)</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nome da escola / organização <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className="ui-input py-2.5 text-sm"
            placeholder={`${accountName.trim() || "Sarah"}'s English Academy`}
            value={orgName}
            onChange={(e) => onOrgName(e.target.value)}
            maxLength={80}
            autoFocus
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Aparecerá no painel dos seus alunos.
          </p>
        </div>
      </div>

      <div className="flex gap-2.5 mt-6">
        <button type="button" onClick={onBack} className="ui-btn ui-btn-secondary ui-btn-lg gap-1.5">
          <ArrowLeft size={15} weight="bold" /> Voltar
        </button>
        <button
          type="button"
          disabled={!canSubmit || loading}
          onClick={onSubmit}
          className="ui-btn ui-btn-primary ui-btn-lg flex-1"
        >
          {loading ? (
            <div className="ui-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          ) : (
            <>Criar escola <ArrowRight size={16} weight="bold" /></>
          )}
        </button>
      </div>
    </>
  );
}
