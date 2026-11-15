import { useRef, useState } from "react";

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function hasFiles(e: React.DragEvent): boolean {
  return Array.from(e.dataTransfer.types).includes("Files");
}

/**
 * Arrastar e soltar um PDF sobre uma área. Retorna `isDragging` para o overlay
 * e os handlers para espalhar no elemento alvo.
 */
export function usePdfDrop(onFile: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const depth = useRef(0);

  const handlers = {
    onDragEnter: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current += 1;
      setIsDragging(true);
    },
    onDragOver: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setIsDragging(false);
    },
    onDrop: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setIsDragging(false);
      const file = Array.from(e.dataTransfer.files).find(isPdf);
      if (file) onFile(file);
    },
  };

  return { isDragging, handlers };
}
