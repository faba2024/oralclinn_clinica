import { canWrite, DOCS } from "@/server/collections";
import { assertSameOrigin, errorResponse, handle, HttpError, json, readJson, requireUser } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ key: string }> };

function resolve(key: string) {
  const entry = DOCS[key];
  if (!entry) throw new HttpError("Documento inexistente.", 404);
  return entry;
}

export async function GET(req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireUser(req);
    return json(await resolve((await params).key).repo.get());
  });
}

export async function PUT(req: Request, { params }: Ctx) {
  return handle(async () => {
    assertSameOrigin(req);
    const user = await requireUser(req);
    const { repo, write } = resolve((await params).key);
    if (!canWrite(user.role, write)) return errorResponse("Seu perfil não tem permissão para esta ação.", 403);
    const body = await readJson(req, 4_000_000);
    if (!body || typeof body !== "object" || Array.isArray(body)) return errorResponse("Dados inválidos.", 400);
    return json(await repo.save(body as object));
  });
}
