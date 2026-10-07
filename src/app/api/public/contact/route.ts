import "@/server/bootstrap";
import { z } from "zod";
import { crmService } from "@/features/crm/service";
import { repositories } from "@/repositories";
import { assertSameOrigin, clientIp, errorResponse, handle, json, rateLimit, readJson } from "@/server/http";
import { onlyDigits } from "@/utils/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(3).max(120),
  phone: z.string().refine((v) => onlyDigits(v).length >= 10 && onlyDigits(v).length <= 13, "Informe um WhatsApp válido."),
  email: z.string().trim().max(160).email("E-mail inválido.").or(z.literal("")),
  interest: z.string().trim().max(120).default(""),
  treatmentId: z.string().max(80).nullable().default(null),
  message: z.string().trim().min(5).max(800),
  website: z.string().optional(),
});

/** Formulário de contato do site: cria um lead no CRM do painel. */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    rateLimit(`contact:${clientIp(req)}`, 8, 10 * 60_000);
    const parsed = schema.safeParse(await readJson(req, 20_000));
    if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Dados inválidos.", 400);
    const v = parsed.data;
    if (v.website) return errorResponse("Não foi possível enviar a mensagem.", 400);
    const treatment = v.treatmentId ? await repositories.treatments.getById(v.treatmentId) : null;
    await crmService.create(
      {
        name: v.name,
        phone: onlyDigits(v.phone),
        email: v.email,
        interest: treatment?.name ?? (v.interest || "Contato pelo site"),
        treatmentId: treatment?.id ?? null,
        source: "site",
        stage: "novo",
        potentialValue: treatment?.priceFrom ?? 0,
        ownerId: "usr_admin",
        notes: v.message,
        patientId: null,
      },
      "Site",
    );
    return json({ ok: true }, 201);
  });
}
