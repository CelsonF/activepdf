"use client";
import type React from "react";
import type { PdfField } from "@/types";

interface FieldMarkerProps {
  field: PdfField;
  selected: boolean;
  onMarkerMouseDown: (e: React.MouseEvent, field: PdfField) => void;
  onResizeMouseDown: (e: React.MouseEvent, field: PdfField) => void;
}

export function FieldMarker({ field, selected, onMarkerMouseDown, onResizeMouseDown }: FieldMarkerProps) {
  return (
    <div
      className={"field-marker" + (selected ? " selected" : "")}
      data-field-id={field.id}
      style={{ left: field.px, top: field.py, width: field.pw, height: field.ph }}
      onMouseDown={(e) => onMarkerMouseDown(e, field)}
    >
      <span className="field-label">
        {field.name}{field.label ? ` · ${field.label}` : ""}
      </span>
      <div
        className="resize-handle"
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeMouseDown(e, field);
        }}
      />
    </div>
  );
}
