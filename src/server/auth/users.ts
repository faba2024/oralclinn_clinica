import type { SessionUser, User, UserRole } from "@/features/users/types";
import { createId } from "@/utils/id";
import { getStore } from "../store";
import { hashPassword, validatePasswordStrength, verifyPassword } from "./password";

/** Usuário como gravado no banco (o hash nunca sai do servidor). */
export interface StoredUser extends User {
  passwordHash: string;
}

const COLLECTION = "users";

const INITIAL_ADMIN = {
  name: "Administrador OralClin",
  email: "admin@oralclin.com.br",
  password: "OralClin@2026",
} as const;

async function ensureInitialAdmin(): Promise<void> {
  const users = await listStoredUsers();
  if (users.length > 0) return;

  const now = new Date().toISOString();
  const admin: StoredUser = {
    id: createId("usr"),
    name: INITIAL_ADMIN.name,
    email: INITIAL_ADMIN.email,
    role: "admin",
    active: true,
    professionalId: null,
    lastLoginAt: null,
    passwordHash: await hashPassword(INITIAL_ADMIN.password),
    createdAt: now,
    updatedAt: now,
  };

  await saveUser(admin);
}
export function sanitize(user: StoredUser): User {
  const { passwordHash: _hash, ...rest } = user;
  return rest;
}

export function toSession(user: User): SessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role, professionalId: user.professionalId };
}

export async function listStoredUsers(): Promise<StoredUser[]> {
  return (await getStore().listCollection<StoredUser>(COLLECTION)) ?? [];
}

export async function getStoredUser(id: string): Promise<StoredUser | null> {
  return getStore().getItem<StoredUser>(COLLECTION, id);
}

async function saveUser(user: StoredUser) {
  await getStore().putItems(COLLECTION, [user], true);
}

/**
 * Autentica exclusivamente contra os usuários persistidos no banco.
 * Nenhuma credencial administrativa de variável de ambiente participa do login.
 */
export async function authenticate(email: string, password: string): Promise<User | null> {
  await ensureInitialAdmin();
  const normalized = email.trim().toLowerCase();
  const user = (await listStoredUsers()).find((u) => u.email.toLowerCase() === normalized);
  // Verifica mesmo quando o usuário não existe, para não revelar e-mails válidos pelo tempo de resposta.
  const ok = await verifyPassword(password, user?.passwordHash ?? "pbkdf2$1000$00$00");
  if (!user || !ok || !user.active) return null;
  const updated = { ...user, lastLoginAt: new Date().toISOString() };
  await saveUser(updated);
  return sanitize(updated);
}

export interface UserInput {
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  professionalId: string | null;
  password?: string;
}

export async function createUser(input: UserInput): Promise<User> {
  const email = input.email.trim().toLowerCase();
  if ((await listStoredUsers()).some((u) => u.email.toLowerCase() === email)) throw new Error("Já existe um usuário com este e-mail.");
  const weak = validatePasswordStrength(input.password ?? "");
  if (weak) throw new Error(weak);
  const now = new Date().toISOString();
  const user: StoredUser = {
    id: createId("usr"),
    name: input.name.trim(),
    email,
    role: input.role,
    active: input.active,
    professionalId: input.professionalId,
    lastLoginAt: null,
    passwordHash: await hashPassword(input.password!),
    createdAt: now,
    updatedAt: now,
  };
  await saveUser(user);
  return sanitize(user);
}

export async function updateUser(id: string, patch: Partial<UserInput>): Promise<User> {
  const current = await getStoredUser(id);
  if (!current) throw new Error("Usuário não encontrado.");
  if (patch.email) {
    const email = patch.email.trim().toLowerCase();
    if ((await listStoredUsers()).some((u) => u.id !== id && u.email.toLowerCase() === email)) throw new Error("Já existe um usuário com este e-mail.");
    patch.email = email;
  }
  const next: StoredUser = { ...current, ...patch, id, updatedAt: new Date().toISOString() } as StoredUser;
  delete (next as Partial<UserInput>).password;
  if (patch.password) {
    const weak = validatePasswordStrength(patch.password);
    if (weak) throw new Error(weak);
    next.passwordHash = await hashPassword(patch.password);
  }
  const admins = (await listStoredUsers()).filter((u) => u.role === "admin" && u.active && u.id !== id);
  if ((next.role !== "admin" || !next.active) && current.role === "admin" && admins.length === 0) {
    throw new Error("É necessário manter pelo menos um administrador ativo.");
  }
  await saveUser(next);
  return sanitize(next);
}

export async function deleteUser(id: string): Promise<void> {
  const current = await getStoredUser(id);
  if (!current) return;
  const admins = (await listStoredUsers()).filter((u) => u.role === "admin" && u.active && u.id !== id);
  if (current.role === "admin" && admins.length === 0) throw new Error("Não é possível excluir o único administrador.");
  await getStore().deleteItem(COLLECTION, id);
}

export async function changeOwnPassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await getStoredUser(id);
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) throw new Error("Senha atual incorreta.");
  const weak = validatePasswordStrength(newPassword);
  if (weak) throw new Error(weak);
  await saveUser({ ...user, passwordHash: await hashPassword(newPassword), updatedAt: new Date().toISOString() });
}
