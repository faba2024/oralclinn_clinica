import { z } from "zod";
import { changeOwnPassword } from "@/server/auth/users";
import { assertSameOrigin, errorResponse, handle, json, readJson, requireUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ currentPassword: z.string().min(1).max(200), newPassword: z.string().min(1).max(200) });

export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    const user = await requireUser(req);
    const parsed = schema.safeParse(await readJson(req, 10_000));
    if (!parsed.success) return errorResponse("Informe a senha atual e a nova senha.", 400);
    try {
      await changeOwnPassword(user.id, parsed.data.currentPassword, parsed.data.newPassword);
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : "Não foi possível alterar a senha.", 400);
    }
    return json({ ok: true });
  });
}
