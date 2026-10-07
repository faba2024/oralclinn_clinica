import { z } from "zod";
import { USER_ROLES } from "@/features/users/types";
import { deleteUser, updateUser } from "@/server/auth/users";
import { assertSameOrigin, errorResponse, handle, json, readJson, requireUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(160).optional(),
  role: z.enum(USER_ROLES as [string, ...string[]]).optional(),
  active: z.boolean().optional(),
  professionalId: z.string().nullable().optional(),
  password: z.string().max(200).optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  return handle(async () => {
    assertSameOrigin(req);
    const user = await requireUser(req);
    if (user.role !== "admin") return errorResponse("Apenas administradores podem gerenciar usuários.", 403);
    const parsed = patchSchema.safeParse(await readJson(req, 20_000));
    if (!parsed.success) return errorResponse("Dados do usuário inválidos.", 400);
    const patch = { ...parsed.data };
    if (!patch.password) delete patch.password;
    try {
      return json(await updateUser((await params).id, patch as Parameters<typeof updateUser>[1]));
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : "Não foi possível salvar o usuário.", 400);
    }
  });
}

export async function DELETE(req: Request, { params }: Ctx) {
  return handle(async () => {
    assertSameOrigin(req);
    const user = await requireUser(req);
    if (user.role !== "admin") return errorResponse("Apenas administradores podem gerenciar usuários.", 403);
    const { id } = await params;
    if (id === user.id) return errorResponse("Você não pode excluir o próprio usuário.", 400);
    try {
      await deleteUser(id);
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : "Não foi possível excluir o usuário.", 400);
    }
    return json({ ok: true });
  });
}
