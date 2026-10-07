import { clearSessionCookie, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Encerra a sessão (botão "Sair" do painel). */
export async function POST() {
  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
}

/** Usado pelo servidor quando a sessão deixou de ser válida (usuário desativado/excluído). */
export async function GET(req: Request) {
  return new Response(null, {
    status: 303,
    headers: { Location: new URL("/admin/login", req.url).toString(), "Set-Cookie": clearSessionCookie(), "Cache-Control": "no-store" },
  });
}
