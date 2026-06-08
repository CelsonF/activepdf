import { create } from "zustand";
import type { AuthUser, UserRole } from "@/types";

interface AuthState {
  user: AuthUser | null;
  login: (name: string, role: UserRole) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  login: (name, role) => set({ user: { name, role } }),
  logout: () => set({ user: null }),
}));
