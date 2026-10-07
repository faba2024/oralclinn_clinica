/**
 * Token de sessão assinado (HMAC-SHA256) — compatível com Edge (middleware)
 * e Node (rotas). Usa apenas Web Crypto, sem dependências.
 */
export const SESSION_COOKIE = "oralclin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 horas

export interface SessionPayload {
  uid: string;
  role: string;
  exp: number; // epoch em segundos
}

const DEV_SECRET = "oralclin-dev-secret-apenas-para-desenvolvimento-local";

export function getAuthSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV !== "production") return DEV_SECRET;
  return null;
}

const enc = new TextEncoder();

function toB64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(value: string): Uint8Array {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(payload: SessionPayload, secret: string): Promise<string> {
  const body = toB64Url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(body)));
  return `${body}.${toB64Url(sig)}`;
}

export async function verifySession(token: string | undefined | null, secret: string | null): Promise<SessionPayload | null> {
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), fromB64Url(sig) as BufferSource, enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64Url(body))) as SessionPayload;
    if (!payload.uid || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}
