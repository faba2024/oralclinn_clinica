import { addDays, format, getDay } from "date-fns";
import type { Appointment, AppointmentStatus } from "@/features/appointments/types";
import { createRandom, isoOffset } from "./helpers";
import { seedPatients } from "./patients";

interface Template {
  treatmentId: string;
  professionalId: string;
  duration: number;
  price: number;
}

const templates: Template[] = [
  { treatmentId: "trt_facetas", professionalId: "prof_camila", duration: 90, price: 1800 },
  { treatmentId: "trt_clareamento", professionalId: "prof_camila", duration: 60, price: 600 },
  { treatmentId: "trt_restauracao", professionalId: "prof_camila", duration: 50, price: 280 },
  { treatmentId: "trt_avaliacao", professionalId: "prof_camila", duration: 40, price: 0 },
  { treatmentId: "trt_implante", professionalId: "prof_lucas", duration: 120, price: 3500 },
  { treatmentId: "trt_protese", professionalId: "prof_lucas", duration: 60, price: 900 },
  { treatmentId: "trt_endodontia", professionalId: "prof_lucas", duration: 90, price: 950 },
  { treatmentId: "trt_avaliacao", professionalId: "prof_lucas", duration: 40, price: 0 },
  { treatmentId: "trt_fonoaudiologia", professionalId: "prof_beatriz", duration: 50, price: 180 },
  { treatmentId: "trt_lentes", professionalId: "prof_camila", duration: 50, price: 450 },
  { treatmentId: "trt_limpeza", professionalId: "prof_camila", duration: 40, price: 250 },
  { treatmentId: "trt_ginecologia", professionalId: "prof_gabriella", duration: 40, price: 250 },
];

const rooms: Record<string, string> = {
  prof_camila: "Consultório 1",
  prof_lucas: "Consultório 2",
  prof_beatriz: "Sala de fonoaudiologia",
  prof_gabriella: "Consultório 3",
};

const slots = ["08:00", "09:30", "11:00", "13:30", "15:00", "16:30"];

function base(
  id: string,
  patientId: string,
  date: string,
  start: string,
  t: Template,
  status: AppointmentStatus,
  extra: Partial<Appointment> = {},
): Appointment {
  const patient = seedPatients().find((p) => p.id === patientId)!;
  const createdAt = isoOffset(-2);
  return {
    id,
    patientId,
    patientName: patient.name,
    patientPhone: patient.phone,
    professionalId: t.professionalId,
    treatmentId: t.treatmentId,
    room: rooms[t.professionalId],
    date,
    start,
    duration: t.duration,
    status,
    price: t.price,
    paymentStatus: status === "finalizada" ? "pago" : "pendente",
    notes: "",
    source: "painel",
    createdAt,
    updatedAt: createdAt,
    ...extra,
  };
}

const T = (treatmentId: string, professionalId: string) =>
  templates.find((t) => t.treatmentId === treatmentId && t.professionalId === professionalId)!;

/** Agenda de hoje e próximos dias — cuidadosamente montada, sem conflitos. */
function curated(): Appointment[] {
  const today = format(new Date(), "yyyy-MM-dd");
  const d = (n: number) => format(addDays(new Date(), n), "yyyy-MM-dd");
  return [
    base("apt_t1", "pac_fernanda", today, "08:00", T("trt_fonoaudiologia", "prof_beatriz"), "finalizada", { notes: "Sessão de fonoterapia — acompanhamento de linguagem." }),
    base("apt_t2", "pac_mariana", today, "08:30", T("trt_facetas", "prof_camila"), "finalizada", { notes: "Prova do mock-up aprovada pela paciente." }),
    base("apt_t3", "pac_joao", today, "09:00", T("trt_implante", "prof_lucas"), "em-atendimento", { notes: "Instalação do implante 36. Paciente em jejum leve." }),
    base("apt_t4", "pac_larissa", today, "10:00", T("trt_fonoaudiologia", "prof_beatriz"), "chegou"),
    base("apt_t5", "pac_ana", today, "10:30", T("trt_clareamento", "prof_camila"), "aguardando"),
    base("apt_t6", "pac_camila_r", today, "14:00", T("trt_avaliacao", "prof_camila"), "confirmada", { source: "online", notes: "Interesse em lentes de contato." }),
    base("apt_t7", "pac_pedro", today, "14:30", T("trt_protese", "prof_lucas"), "confirmada"),
    base("apt_t8", "pac_thiago", today, "15:30", T("trt_limpeza", "prof_camila"), "agendada"),
    base("apt_t9", "pac_bruno", today, "16:30", T("trt_avaliacao", "prof_lucas"), "agendada", { source: "online" }),
    base("apt_f1", "pac_rafael", d(1), "09:00", T("trt_endodontia", "prof_lucas"), "confirmada"),
    base("apt_f2", "pac_gustavo", d(1), "10:00", T("trt_restauracao", "prof_camila"), "agendada"),
    base("apt_f3", "pac_helena", d(1), "14:00", T("trt_implante", "prof_lucas"), "agendada", { notes: "Confirmar suspensão de anticoagulante com o cardiologista." }),
    base("apt_f4", "pac_lucas_m", d(1), "15:00", T("trt_avaliacao", "prof_camila"), "aguardando", { source: "online" }),
    base("apt_f5", "pac_mariana", d(2), "16:00", T("trt_facetas", "prof_camila"), "agendada"),
    base("apt_f6", "pac_fernanda", d(3), "11:00", T("trt_lentes", "prof_camila"), "agendada"),
    base("apt_f7", "pac_carlos", d(3), "09:30", T("trt_avaliacao", "prof_lucas"), "agendada", { notes: "Retorno semestral." }),
    base("apt_f8", "pac_juliana", d(4), "13:30", T("trt_clareamento", "prof_camila"), "agendada"),
    base("apt_f9", "pac_larissa", d(6), "10:00", T("trt_lentes", "prof_camila"), "agendada"),
    base("apt_f10", "pac_joao", d(8), "09:00", T("trt_protese", "prof_lucas"), "agendada"),
    base("apt_f11", "pac_ana", d(10), "15:00", T("trt_clareamento", "prof_camila"), "agendada"),
  ];
}

/** Histórico dos últimos 90 dias para relatórios e perfis. */
function history(): Appointment[] {
  const rand = createRandom(2026);
  const patients = seedPatients();
  const result: Appointment[] = [];
  for (let offset = -90; offset <= -1; offset++) {
    const date = addDays(new Date(), offset);
    const weekday = getDay(date);
    if (weekday === 0) continue;
    const perDay = weekday === 6 ? rand.int(1, 2) : rand.int(3, 6);
    const used = new Set<string>();
    for (let i = 0; i < perDay; i++) {
      const t = rand.pick(templates);
      if (weekday === 6 && t.professionalId !== "prof_lucas") continue;
      const slot = rand.pick(slots);
      const key = `${t.professionalId}-${slot}`;
      if (used.has(key)) continue;
      used.add(key);
      const eligible = patients.filter((p) => {
        const created = new Date(p.createdAt).getTime();
        return created <= date.getTime() && p.status !== "novo";
      });
      if (eligible.length === 0) continue;
      const patient = rand.pick(eligible);
      const roll = rand.next();
      const status: AppointmentStatus = roll < 0.07 ? "faltou" : roll < 0.13 ? "cancelada" : "finalizada";
      const iso = format(date, "yyyy-MM-dd");
      result.push(
        base(`apt_h${offset}_${i}`, patient.id, iso, slot, t, status, {
          paymentStatus: status === "finalizada" ? (t.price === 0 ? "cortesia" : "pago") : "pendente",
          source: rand.next() < 0.18 ? "online" : "painel",
          createdAt: isoOffset(offset - 7),
          updatedAt: isoOffset(offset),
        }),
      );
    }
  }
  return result;
}

export function seedAppointments(): Appointment[] {
  return [...history(), ...curated()];
}
