import { NotFoundError } from "@/repositories/core/backend";
import type { SessionUser } from "@/features/users/types";
import { getStoredUser, sanitize, toSession } from "./auth/users";
import { getAuthSecret, readCookie, SESSION_COOKIE, SESSION_TTL_SECONDS, verifySession } from "./auth/token";
import { StorageNotConfiguredError } from "./store";

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

export const errorResponse = (message: string, status = 400) => json({ error: message }, status);

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Converte exceções em respostas JSON padronizadas (sem vazar detalhes internos). */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpError) return errorResponse(error.message, error.status);
    if (error instanceof NotFoundError) return errorResponse("Registro não encontrado.", 404);
    if (error instanceof StorageNotConfiguredError) return errorResponse(error.message, 503);
    console.error("[api]", error);
    return errorResponse("Erro interno do servidor. Tente novamente.", 500);
  }
}

export async function readJson<T = Record<string, unknown>>(req: Request, maxBytes = 1_500_000): Promise<T> {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError("Conteúdo muito grande.", 413);
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new HttpError("JSON inválido.", 400);
  }
}

/** Lê e valida a sessão do cookie e confirma no banco que o usuário segue ativo. */
export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const payload = await verifySession(readCookie(req.headers.get("cookie"), SESSION_COOKIE), getAuthSecret());
  if (!payload) return null;
  const user = await getStoredUser(payload.uid);
  if (!user || !user.active) return null;
  return toSession(sanitize(user));
}

export async function requireUser(req: Request): Promise<SessionUser> {
  const user = await getSessionUser(req);
  if (!user) throw new HttpError("Não autenticado.", 401);
  return user;
}

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

/** Bloqueia requisições de escrita vindas de outra origem (proteção CSRF complementar ao SameSite). */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw new HttpError("Origem não permitida.", 403);
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError("Origem não permitida.", 403);
  }
}

/** Limite simples de tentativas por chave (memória da instância). */
const attempts = new Map<string, { count: number; until: number }>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.until < now) {
    attempts.set(key, { count: 1, until: now + windowMs });
    return;
  }
  entry.count += 1;
  if (entry.count > max) throw new HttpError("Muitas tentativas. Aguarde alguns minutos e tente novamente.", 429);
}

export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}
