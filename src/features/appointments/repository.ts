import { CollectionRepository } from "@/repositories/core/collection-repository";
import type { Repository } from "@/repositories/core/repository";
import { seedAppointments } from "@/data/seed";
import type { Appointment } from "./types";

export interface AppointmentRepository extends Repository<Appointment> {
  listByRange(from: string, to: string): Promise<Appointment[]>;
  listByPatient(patientId: string): Promise<Appointment[]>;
  listByDate(date: string): Promise<Appointment[]>;
}

export class DefaultAppointmentRepository extends CollectionRepository<Appointment> implements AppointmentRepository {
  constructor() {
    super("appointments", seedAppointments, "apt");
  }

  async listByRange(from: string, to: string): Promise<Appointment[]> {
    return (await this.list()).filter((a) => a.date >= from && a.date <= to);
  }

  async listByPatient(patientId: string): Promise<Appointment[]> {
    return (await this.list()).filter((a) => a.patientId === patientId);
  }

  async listByDate(date: string): Promise<Appointment[]> {
    return (await this.list()).filter((a) => a.date === date);
  }
}
