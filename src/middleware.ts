import { NextResponse, type NextRequest } from "next/server";
import { getAuthSecret, SESSION_COOKIE, verifySession } from "@/server/auth/token";

/**
 * Proteção do painel administrativo (mesmo projeto e mesmo domínio do site).
 * - /admin/* sem sessão válida → /admin/login?next=…
 * - /api/admin/* sem sessão válida → 401
 * - /admin/login com sessão válida → /admin
 * A assinatura do cookie é verificada aqui; as rotas da API confirmam o usuário no banco.
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value, getAuthSecret());

  if (pathname.startsWith("/api/admin")) {
    if (!session) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.next();
  }

  const isLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login/");
  let res: NextResponse;
  if (isLogin) {
    res = session ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.next();
  } else if (!session) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", `${pathname}${search}`);
    res = NextResponse.redirect(url);
    if (req.cookies.get(SESSION_COOKIE)) res.cookies.delete(SESSION_COOKIE);
  } else {
    res = NextResponse.next();
  }
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
