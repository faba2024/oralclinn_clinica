import { z } from "zod";
import { USER_ROLES } from "@/features/users/types";
import { createUser, listStoredUsers, sanitize } from "@/server/auth/users";
import { assertSameOrigin, errorResponse, handle, json, readJson, requireUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const userSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  role: z.enum(USER_ROLES as [string, ...string[]]),
  active: z.boolean(),
  professionalId: z.string().nullable(),
  password: z.string().max(200).optional(),
});

export async function GET(req: Request) {
  return handle(async () => {
    await requireUser(req);
    return json((await listStoredUsers()).map(sanitize));
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    const user = await requireUser(req);
    if (user.role !== "admin") return errorResponse("Apenas administradores podem gerenciar usuários.", 403);
    const parsed = userSchema.safeParse(await readJson(req, 20_000));
    if (!parsed.success) return errorResponse("Dados do usuário inválidos.", 400);
    try {
      return json(await createUser(parsed.data as Parameters<typeof createUser>[0]), 201);
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : "Não foi possível criar o usuário.", 400);
    }
  });
}
