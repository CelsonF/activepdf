import { useEffect, useRef } from "react";

interface Options {
  /** Há um campo selecionado no modo de edição — habilita Del/Esc/setas. */
  selectionActive: boolean;
  onDelete: () => void;
  onDeselect: () => void;
  /** Deslocamento em pixels da página renderizada. */
  onNudge: (dx: number, dy: number) => void;
  onSave: () => void;
}

const ARROWS: Readonly<Record<string, readonly [number, number]>> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/** Atalhos de teclado do editor de PDF. Ignora teclas digitadas em inputs e nas notas. */
export function useEditorShortcuts(options: Options) {
  const ref = useRef(options);
  ref.current = options;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const o = ref.current;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        o.onSave();
        return;
      }
      if (!o.selectionActive || isTypingTarget(e.target)) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        o.onDelete();
      } else if (e.key === "Escape") {
        o.onDeselect();
      } else if (e.key in ARROWS) {
        e.preventDefault();
        const [dx, dy] = ARROWS[e.key];
        const step = e.shiftKey ? 10 : 1;
        o.onNudge(dx * step, dy * step);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
