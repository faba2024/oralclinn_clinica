import "@/server/bootstrap";
import { appointmentService } from "@/features/appointments/service";
import { repositories } from "@/repositories";
import { errorResponse, handle, json } from "@/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  return handle(async () => {
    const url = new URL(req.url);
    const professionalId = url.searchParams.get("professionalId") ?? "";
    const treatmentId = url.searchParams.get("treatmentId") ?? "";
    const date = url.searchParams.get("date") ?? "";
    if (!professionalId || !treatmentId || !DATE.test(date)) return errorResponse("Parâmetros inválidos.", 400);
    const [settings, treatment] = await Promise.all([repositories.settings.get(), repositories.treatments.getById(treatmentId)]);
    if (!settings.agenda.allowOnlineBooking || !treatment || !treatment.active) return json({ slots: [] });
    const slots = await appointmentService.availableSlots(professionalId, date, treatment.durationMinutes);
    return json({ slots });
  });
}
