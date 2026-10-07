import { clearSessionCookie, getSessionUser, handle, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    const user = await getSessionUser(req);
    if (!user) return json({ error: "Não autenticado." }, 401, { "Set-Cookie": clearSessionCookie() });
    return json({ user });
  });
}
