import { canWrite, COLLECTIONS } from "@/server/collections";
import { assertSameOrigin, errorResponse, handle, HttpError, json, readJson, requireUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ collection: string; id: string }> };

function resolve(name: string) {
  const entry = COLLECTIONS[name];
  if (!entry) throw new HttpError("Coleção inexistente.", 404);
  return entry;
}

export async function GET(req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireUser(req);
    const { collection, id } = await params;
    const item = await resolve(collection).repo.getById(id);
    return item ? json(item) : errorResponse("Registro não encontrado.", 404);
  });
}

export async function PATCH(req: Request, { params }: Ctx) {
  return handle(async () => {
    assertSameOrigin(req);
    const user = await requireUser(req);
    const { collection, id } = await params;
    const { repo, write } = resolve(collection);
    if (!canWrite(user.role, write)) return errorResponse("Seu perfil não tem permissão para esta ação.", 403);
    const body = await readJson(req);
    if (!body || typeof body !== "object" || Array.isArray(body)) return errorResponse("Dados inválidos.", 400);
    const { id: _id, createdAt: _c, updatedAt: _u, ...patch } = body as Record<string, unknown>;
    return json(await repo.update(id, patch as never));
  });
}

export async function DELETE(req: Request, { params }: Ctx) {
  return handle(async () => {
    assertSameOrigin(req);
    const user = await requireUser(req);
    const { collection, id } = await params;
    const { repo, write } = resolve(collection);
    if (!canWrite(user.role, write)) return errorResponse("Seu perfil não tem permissão para esta ação.", 403);
    await repo.remove(id);
    return json({ ok: true });
  });
}
