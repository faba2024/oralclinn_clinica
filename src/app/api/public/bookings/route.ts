import "@/server/bootstrap";
import { addDays, format } from "date-fns";
import { z } from "zod";
import { AppointmentConflictError, appointmentService } from "@/features/appointments/service";
import { repositories } from "@/repositories";
import { assertSameOrigin, clientIp, errorResponse, handle, json, rateLimit, readJson } from "@/server/http";
import { clinicNow } from "@/utils/dates";
import { onlyDigits } from "@/utils/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  treatmentId: z.string().min(1).max(80),
  professionalId: z.string().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().trim().min(3).max(120).refine((v) => v.split(/\s+/).length >= 2, "Informe nome e sobrenome."),
  phone: z.string().refine((v) => onlyDigits(v).length >= 10 && onlyDigits(v).length <= 13, "Informe um WhatsApp válido com DDD."),
  email: z.string().trim().max(160).email("E-mail inválido.").or(z.literal("")),
  notes: z.string().max(800).default(""),
  website: z.string().optional(),
});

/** Agendamento online do site: grava paciente, consulta, lead e notificação no banco compartilhado com o painel. */
export async function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    rateLimit(`booking:${clientIp(req)}`, 10, 10 * 60_000);
    const parsed = schema.safeParse(await readJson(req, 20_000));
    if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "Dados inválidos.", 400);
    const input = parsed.data;
    // Honeypot: robôs preenchem o campo oculto — responde sem gravar.
    if (input.website) return errorResponse("Não foi possível concluir o agendamento.", 400);

    const [settings, treatment, professional] = await Promise.all([
      repositories.settings.get(),
      repositories.treatments.getById(input.treatmentId),
      repositories.professionals.getById(input.professionalId),
    ]);
    if (!settings.agenda.allowOnlineBooking) return errorResponse("O agendamento online está temporariamente indisponível. Fale conosco pelo WhatsApp.", 400);
    if (!treatment || !treatment.active) return errorResponse("Tratamento indisponível.", 400);
    if (!professional || professional.status !== "ativo" || !professional.showOnSite || !treatment.professionalIds.includes(professional.id)) {
      return errorResponse("Profissional indisponível para este tratamento.", 400);
    }
    const today = clinicNow().date;
    const maxDate = format(addDays(new Date(`${today}T12:00:00`), 60), "yyyy-MM-dd");
    if (input.date < today || input.date > maxDate) return errorResponse("Escolha uma data dentro dos próximos 60 dias.", 400);

    const slots = await appointmentService.availableSlots(professional.id, input.date, treatment.durationMinutes);
    if (!slots.includes(input.start)) return errorResponse("Este horário acabou de ser reservado. Escolha outro horário, por favor.", 409);

    try {
      const appointment = await appointmentService.bookOnline({
        treatmentId: treatment.id,
        professionalId: professional.id,
        date: input.date,
        start: input.start,
        name: input.name,
        phone: input.phone,
        email: input.email,
        notes: input.notes,
      });
      return json({ appointment }, 201);
    } catch (e) {
      if (e instanceof AppointmentConflictError) return errorResponse("Este horário acabou de ser reservado. Escolha outro horário, por favor.", 409);
      throw e;
    }
  });
}
