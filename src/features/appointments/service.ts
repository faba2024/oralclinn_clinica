import { getDay, parseISO } from "date-fns";
import { repositories } from "@/repositories";
import { notificationService } from "@/features/notifications/service";
import type { CreateInput } from "@/types/common";
import { formatDate, onlyDigits } from "@/utils/format";
import { buildTimeSlots, rangesOverlap, timeToMinutes, clinicNow } from "@/utils/dates";
import type { Appointment, AppointmentStatus } from "./types";

export const INACTIVE_STATUSES: AppointmentStatus[] = ["cancelada", "faltou"];

export class AppointmentConflictError extends Error {
  constructor(public readonly conflict: Appointment, public readonly reason: "profissional" | "sala") {
    super(
      reason === "profissional"
        ? `Conflito: o profissional já atende ${conflict.patientName} às ${conflict.start}.`
        : `Conflito: ${conflict.room} já está ocupado às ${conflict.start}.`,
    );
    this.name = "AppointmentConflictError";
  }
}

type Candidate = Pick<Appointment, "date" | "start" | "duration" | "professionalId" | "room">;

export function findConflict(candidate: Candidate, appointments: Appointment[], excludeId?: string) {
  const start = timeToMinutes(candidate.start);
  const end = start + candidate.duration;
  for (const a of appointments) {
    if (a.id === excludeId || a.date !== candidate.date || INACTIVE_STATUSES.includes(a.status)) continue;
    const aStart = timeToMinutes(a.start);
    if (!rangesOverlap(start, end, aStart, aStart + a.duration)) continue;
    if (a.professionalId === candidate.professionalId) return { conflict: a, reason: "profissional" as const };
    if (candidate.room && a.room === candidate.room) return { conflict: a, reason: "sala" as const };
  }
  return null;
}

export interface OnlineBookingInput {
  treatmentId: string;
  professionalId: string;
  date: string;
  start: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export const appointmentService = {
  list: () => repositories.appointments.list(),
  listRange: (from: string, to: string) => repositories.appointments.listByRange(from, to),
  listByPatient: async (patientId: string) =>
    (await repositories.appointments.listByPatient(patientId)).sort((a, b) =>
      `${b.date}${b.start}`.localeCompare(`${a.date}${a.start}`),
    ),
  get: (id: string) => repositories.appointments.getById(id),

  async create(input: CreateInput<Appointment>): Promise<Appointment> {
    const all = await repositories.appointments.listByDate(input.date);
    const found = findConflict(input, all);
    if (found) throw new AppointmentConflictError(found.conflict, found.reason);
    const created = await repositories.appointments.create(input);
    if (input.source === "online") {
      await notificationService.push(
        "nova-consulta",
        "Agendamento online",
        `${input.patientName} agendou pelo site para ${formatDate(input.date, "dd/MM")} às ${input.start}.`,
        "/admin/agendamentos",
      );
    }
    return created;
  },

  async update(id: string, patch: Partial<Appointment>): Promise<Appointment> {
    const current = await repositories.appointments.getById(id);
    if (!current) throw new Error("Consulta não encontrada.");
    const next = { ...current, ...patch };
    const scheduleChanged =
      next.date !== current.date ||
      next.start !== current.start ||
      next.duration !== current.duration ||
      next.professionalId !== current.professionalId ||
      next.room !== current.room;
    if (scheduleChanged && !INACTIVE_STATUSES.includes(next.status)) {
      const all = await repositories.appointments.listByDate(next.date);
      const found = findConflict(next, all, id);
      if (found) throw new AppointmentConflictError(found.conflict, found.reason);
    }
    return repositories.appointments.update(id, patch);
  },

  async setStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const updated = await repositories.appointments.update(id, { status });
    if (status === "cancelada") {
      await notificationService.push(
        "consulta-cancelada",
        "Consulta cancelada",
        `${updated.patientName} — ${formatDate(updated.date, "dd/MM")} às ${updated.start}.`,
        "/admin/agenda",
      );
    }
    if (status === "chegou") {
      await notificationService.push(
        "paciente-aguardando",
        "Paciente na recepção",
        `${updated.patientName} chegou para o horário das ${updated.start}.`,
        "/admin/agenda",
      );
    }
    return updated;
  },

  remove: (id: string) => repositories.appointments.remove(id),

  /** Horários livres de um profissional — respeita expediente, agenda e antecedência mínima. */
  async availableSlots(professionalId: string, date: string, duration: number): Promise<string[]> {
    const [professional, settings, dayAppointments] = await Promise.all([
      repositories.professionals.getById(professionalId),
      repositories.settings.get(),
      repositories.appointments.listByDate(date),
    ]);
    if (!professional) return [];
    const weekday = getDay(parseISO(date));
    const hours = professional.workingHours.find((h) => h.weekday === weekday);
    if (!hours || !settings.agenda.workingDays.includes(weekday)) return [];
    const open = hours.start > settings.agenda.openTime ? hours.start : settings.agenda.openTime;
    const close = hours.end < settings.agenda.closeTime ? hours.end : settings.agenda.closeTime;
    const now = clinicNow();
    if (date < now.date) return [];
    const minMinutes = date === now.date ? now.minutes + settings.agenda.onlineBookingLeadHours * 60 : -1;
    return buildTimeSlots(open, close, settings.agenda.slotMinutes).filter((slot) => {
      const start = timeToMinutes(slot);
      if (start < minMinutes) return false;
      if (start + duration > timeToMinutes(close)) return false;
      if (start >= 12 * 60 && start < 13 * 60) return false; // intervalo de almoço
      return !findConflict({ date, start: slot, duration, professionalId, room: "" }, dayAppointments);
    });
  },

  /** Agendamento do site: localiza/cria paciente, cria consulta e lead no CRM. */
  async bookOnline(input: OnlineBookingInput): Promise<Appointment> {
    const [treatment, patients] = await Promise.all([
      repositories.treatments.getById(input.treatmentId),
      repositories.patients.list(),
    ]);
    if (!treatment) throw new Error("Tratamento indisponível.");
    const phone = onlyDigits(input.phone);
    let patient = patients.find((p) => onlyDigits(p.phone) === phone) ?? null;
    if (!patient) {
      patient = await repositories.patients.create({
        name: input.name.trim(),
        phone,
        email: input.email.trim(),
        cpf: "",
        birthDate: "",
        gender: "",
        address: "",
        occupation: "",
        responsibleProfessionalId: input.professionalId,
        status: "novo",
        origin: "site",
        importantNotes: "",
        tags: ["agendamento-online"],
      });
    }
    const professional = await repositories.professionals.getById(input.professionalId);
    const settings = await repositories.settings.get();
    const appointment = await appointmentService.create({
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: phone,
      professionalId: input.professionalId,
      treatmentId: input.treatmentId,
      room: professional ? roomFor(professional.id, settings.agenda.rooms) : settings.agenda.rooms[0] ?? "",
      date: input.date,
      start: input.start,
      duration: treatment.durationMinutes,
      status: "agendada",
      price: treatment.priceFrom,
      paymentStatus: "pendente",
      notes: input.notes,
      source: "online",
    });
    const now = new Date().toISOString();
    await repositories.leads.create({
      name: patient.name,
      phone,
      email: input.email,
      interest: treatment.name,
      treatmentId: treatment.id,
      source: "site",
      stage: "avaliacao-agendada",
      potentialValue: treatment.priceFrom,
      ownerId: "usr_admin",
      lastContactAt: now,
      notes: input.notes,
      patientId: patient.id,
      timeline: [
        {
          id: `lev_${Date.now()}`,
          type: "avaliacao",
          description: `Agendamento online para ${formatDate(input.date, "dd/MM")} às ${input.start}.`,
          at: now,
          author: "Site",
        },
      ],
    });
    return appointment;
  },
};

function roomFor(professionalId: string, rooms: string[]): string {
  const map: Record<string, number> = { prof_camila: 0, prof_lucas: 1, prof_beatriz: 2 };
  return rooms[map[professionalId] ?? 0] ?? rooms[0] ?? "";
}
