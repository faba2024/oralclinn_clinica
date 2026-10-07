"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UiState {
  commandOpen: boolean;
  mobileNavOpen: boolean;
  sidebarCollapsed: boolean;
  shortcutsOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setShortcutsOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      commandOpen: false,
      mobileNavOpen: false,
      sidebarCollapsed: false,
      shortcutsOpen: false,
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
    }),
    {
      name: "oralclin:ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
);
