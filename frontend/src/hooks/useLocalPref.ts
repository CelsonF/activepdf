"use client";
import { useEffect, useState } from "react";

/**
 * Preferência do usuário persistida em localStorage (escopo: este dispositivo).
 * Para preferências sem significado no backend (notificações, meta diária etc.).
 */
export function useLocalPref<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // valor corrompido — mantém o default
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function set(v: T) {
    setValue(v);
    try {
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch {
      // storage cheio/indisponível — preferência vale só para a sessão
    }
  }

  return [value, set];
}
