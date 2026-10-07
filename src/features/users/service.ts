import { apiFetch } from "@/repositories/api/api-backend";
import { dataBus } from "@/repositories/core/data-bus";
import type { SessionUser, User, UserRole } from "./types";

/**
 * Autenticação real: as credenciais são verificadas no servidor (/api/auth/*),
 * a senha é guardada apenas como hash e a sessão fica em cookie httpOnly assinado.
 * Nenhuma senha é armazenada ou comparada no navegador.
 */
export const authService = {
  login: (email: string, password: string) =>
    apiFetch<{ user: SessionUser }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }).then((r) => r.user),
  logout: () => apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  me: () => apiFetch<{ user: SessionUser }>("/api/auth/me").then((r) => r.user),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<{ ok: true }>("/api/auth/password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }),
};

export interface UserInput {
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  professionalId: string | null;
  /** Obrigatória na criação; opcional na edição (vazia = mantém a atual). */
  password?: string;
}

export const userService = {
  list: async () => (await apiFetch<User[]>("/api/admin/users")).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
  async create(input: UserInput) {
    const user = await apiFetch<User>("/api/admin/users", { method: "POST", body: JSON.stringify(input) });
    dataBus.emit("users");
    return user;
  },
  async update(id: string, patch: Partial<UserInput>) {
    const user = await apiFetch<User>(`/api/admin/users/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
    dataBus.emit("users");
    return user;
  },
  async remove(id: string) {
    await apiFetch(`/api/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" });
    dataBus.emit("users");
  },
};
