"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...toast, id }] }));
    setTimeout(() => get().dismiss(id), toast.tone === "error" ? 6000 : 4000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** API simples: toast.success("Salvo"), toast.error("Falhou", "detalhe"). */
export const toast = {
  success: (title: string, description?: string) => useToastStore.getState().push({ title, description, tone: "success" }),
  error: (title: string, description?: string) => useToastStore.getState().push({ title, description, tone: "error" }),
  info: (title: string, description?: string) => useToastStore.getState().push({ title, description, tone: "info" }),
};
