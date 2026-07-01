import { create } from "zustand";

interface UIState {
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  globalSearch: "",
  setGlobalSearch: (q) => set({ globalSearch: q }),
}));