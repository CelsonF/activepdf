"use client";
import { useRef } from "react";
import { Building, Camera, CheckCircle } from "@phosphor-icons/react";
import { FieldRow } from "./controls";

export interface OrgData {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

interface OrganizationSectionProps {
  org: OrgData | null;
  orgName: string;
  onOrgName: (v: string) => void;
  logoPreview: string | null;
  onLogoFile: (file: File) => void;
  loading: boolean;
  saved: boolean;
  onSave: () => void;
  backendBase: string;
}

export function OrganizationSection({
  org, orgName, onOrgName, logoPreview, onLogoFile, loading, saved, onSave, backendBase,
}: OrganizationSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-0.5">Organização</h2>
        <p className="text-sm text-slate-500">Nome e logo exibidos para seus alunos.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div
            className="w-20 h-20 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview.startsWith("data:") ? logoPreview : `${backendBase}${logoPreview}`}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <Building size={28} className="text-slate-300" weight="bold" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center shadow-sm hover:bg-brand-dark"
          >
            <Camera size={13} weight="bold" />
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
          <p className="text-sm font-semibold text-slate-800">{org?.name ?? "Sua escola"}</p>
          <p className="text-xs text-slate-400 mt-0.5">Clique no ícone para mudar o logo</p>
          {org?.slug && (
            <p className="text-[11px] text-slate-300 mt-1 font-mono">/{org.slug}</p>
          )}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <FieldRow label="Nome da escola / organização" hint="Máximo 80 caracteres.">
        <input
          type="text"
          className="ui-input py-2.5 text-sm"
          value={orgName}
          onChange={(e) => onOrgName(e.target.value)}
          placeholder="Ex: Sarah's English Academy"
          maxLength={80}
        />
      </FieldRow>

      <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={loading || !orgName.trim()}
          className="ui-btn ui-btn-primary ui-btn-md"
        >
          {loading ? (
            <div className="ui-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
          ) : (
            "Salvar organização"
          )}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 animate-fadeUp">
            <CheckCircle size={15} weight="fill" /> Salvo com sucesso
          </span>
        )}
      </div>
    </div>
  );
}
