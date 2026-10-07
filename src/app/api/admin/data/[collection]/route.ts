import { canWrite, COLLECTIONS } from "@/server/collections";
import { assertSameOrigin, errorResponse, handle, HttpError, json, readJson, requireUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ collection: string }> };

function resolve(name: string) {
  const entry = COLLECTIONS[name];
  if (!entry) throw new HttpError("Coleção inexistente.", 404);
  return entry;
}

export async function GET(req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireUser(req);
    const { repo } = resolve((await params).collection);
    return json(await repo.list());
  });
}

export async function POST(req: Request, { params }: Ctx) {
  return handle(async () => {
    assertSameOrigin(req);
    const user = await requireUser(req);
    const { repo, write } = resolve((await params).collection);
    if (!canWrite(user.role, write)) return errorResponse("Seu perfil não tem permissão para esta ação.", 403);
    const body = await readJson(req);
    if (!body || typeof body !== "object" || Array.isArray(body)) return errorResponse("Dados inválidos.", 400);
    const { createdAt: _c, updatedAt: _u, ...input } = body as Record<string, unknown>;
    return json(await repo.create(input as never), 201);
  });
}
