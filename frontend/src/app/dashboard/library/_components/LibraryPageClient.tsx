"use client";
import { useState } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import { UploadModal } from "./UploadModal";

export function LibraryPageClient() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowUpload(true)}
        className="ui-btn ui-btn-primary ui-btn-md gap-1.5"
      >
        <UploadSimple size={14} weight="bold" /> Adicionar PDF
      </button>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}
