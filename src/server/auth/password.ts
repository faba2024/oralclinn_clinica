/** Hash de senha com PBKDF2-SHA256 (Web Crypto) e comparação em tempo constante. */
const ITERATIONS = 210_000;
const enc = new TextEncoder();

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
const unhex = (value: string) => Uint8Array.from(value.match(/.{2}/g) ?? [], (h) => parseInt(h, 16));

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, key, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${hex(salt)}$${hex(hash)}`;
}

export async function verifyPassword(password: string, stored: string | undefined): Promise<boolean> {
  if (!stored) return false;
  const [scheme, iter, saltHex, hashHex] = stored.split("$");
  if (scheme !== "pbkdf2" || !iter || !saltHex || !hashHex) return false;
  const actual = await derive(password, unhex(saltHex), Number(iter));
  const expected = unhex(hashHex);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Use letras e números na senha.";
  return null;
}
