"use client";

import { createContext, createElement, useContext, type ReactNode } from "react";
import type { SessionUser } from "@/features/users/types";

/**
 * Usuário logado no painel. A sessão vive no cookie httpOnly assinado e é
 * validada no servidor (middleware + layout do painel), que entrega o usuário
 * a este contexto. Nada de sessão é salvo no navegador, e cada requisição
 * renderiza com o próprio usuário (sem estado global compartilhado no servidor).
 */
const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({ user, children }: { user: SessionUser; children: ReactNode }) {
  return createElement(SessionContext.Provider, { value: user }, children);
}

interface AuthState {
  user: SessionUser | null;
}

/** Mantém a mesma API de seletor usada pelos componentes do painel. */
export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  const user = useContext(SessionContext);
  return selector({ user });
}
