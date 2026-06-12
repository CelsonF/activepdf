"use client";
import { createContext, useContext } from "react";
import type { EditorPersistence } from "./types";

const PersistenceContext = createContext<EditorPersistence | null>(null);

interface ProviderProps {
  persistence: EditorPersistence;
  children: React.ReactNode;
}

export function EditorPersistenceProvider({ persistence, children }: ProviderProps) {
  return (
    <PersistenceContext.Provider value={persistence}>{children}</PersistenceContext.Provider>
  );
}

export function useEditorPersistence(): EditorPersistence {
  const persistence = useContext(PersistenceContext);
  if (!persistence) {
    throw new Error("useEditorPersistence precisa estar dentro de <EditorPersistenceProvider>.");
  }
  return persistence;
}
