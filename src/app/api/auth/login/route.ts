import { z } from "zod";
import { authenticate, toSession } from "@/server/auth/users";
import { getAuthSecret, SESSION_TTL_SECONDS, signSession } from "@/server/auth/token";
import { assertSameOrigin, clientIp, errorResponse, handle, json, rateLimit, readJson, sessionCookie } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().email().max(160), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    const parsed = schema.safeParse(await readJson(req, 10_000));
    if (!parsed.success) return errorResponse("Informe e-mail e senha válidos.", 400);
    const { email, password } = parsed.data;
    rateLimit(`login:${clientIp(req)}:${email.toLowerCase()}`, 8, 15 * 60_000);

    const secret = getAuthSecret();
    if (!secret) return errorResponse("AUTH_SECRET não configurado no servidor. Defina a variável de ambiente e publique novamente.", 503);

    const user = await authenticate(email, password);
    if (!user) return errorResponse("E-mail ou senha incorretos.", 401);

    const token = await signSession({ uid: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }, secret);
    return json({ user: toSession(user) }, 200, { "Set-Cookie": sessionCookie(token) });
  });
}
