import { listStoredUsers } from "@/server/auth/users";
import { assertSameOrigin, errorResponse, handle, json, requireUser } from "@/server/http";
import { getStore } from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Restaura os dados iniciais (seed). Usuários e senhas são preservados. Somente administrador. */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    const user = await requireUser(req);
    if (user.role !== "admin") return errorResponse("Apenas administradores podem restaurar os dados.", 403);
    const users = await listStoredUsers();
    const store = getStore();
    await store.clearAll();
    await store.putItems("users", users, true);
    return json({ ok: true });
  });
}
