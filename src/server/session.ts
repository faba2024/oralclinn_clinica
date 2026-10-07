import { cookies } from "next/headers";
import type { SessionUser } from "@/features/users/types";
import { getAuthSecret, SESSION_COOKIE, verifySession } from "./auth/token";
import { getStoredUser, sanitize, toSession } from "./auth/users";

/** Usuário logado em Server Components (layout do painel). */
export async function getServerSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const payload = await verifySession(jar.get(SESSION_COOKIE)?.value, getAuthSecret());
  if (!payload) return null;
  const user = await getStoredUser(payload.uid);
  if (!user || !user.active) return null;
  return toSession(sanitize(user));
}
