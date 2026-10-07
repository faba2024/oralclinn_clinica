/**
 * Container de repositórios.
 *
 * Os repositórios delegam a persistência ao DataBackend ativo:
 * - navegador → ApiBackend (rotas /api/admin, dados no servidor);
 * - servidor  → ServerBackend (Supabase em produção, arquivo local em dev).
 * Para trocar o banco (PostgreSQL, Prisma, Firebase…), implemente um novo
 * DataStore em src/server/store — telas e services não mudam.
 */
import "./api/api-backend";
import { DefaultAppointmentRepository, type AppointmentRepository } from "@/features/appointments/repository";
import { DefaultBeforeAfterRepository, type BeforeAfterRepository } from "@/features/before-after/repository";
import { DefaultTreatmentPlanRepository, type TreatmentPlanRepository } from "@/features/budgets/repository";
import { DefaultSiteContentRepository, type SiteContentRepository } from "@/features/content/repository";
import { DefaultLeadRepository, type LeadRepository } from "@/features/crm/repository";
import { DefaultDocumentRepository, type DocumentRepository } from "@/features/documents/repository";
import {
  DefaultExpenseRepository,
  DefaultReceivableRepository,
  type ExpenseRepository,
  type ReceivableRepository,
} from "@/features/finance/repository";
import { DefaultNotificationRepository, type NotificationRepository } from "@/features/notifications/repository";
import { DefaultPatientRepository, type PatientRepository } from "@/features/patients/repository";
import { DefaultProfessionalRepository, type ProfessionalRepository } from "@/features/professionals/repository";
import { DefaultClinicalRecordRepository, type ClinicalRecordRepository } from "@/features/records/repository";
import { DefaultSettingsRepository, type SettingsRepository } from "@/features/settings/repository";
import { DefaultTreatmentRepository, type TreatmentRepository } from "@/features/treatments/repository";

export interface Repositories {
  patients: PatientRepository;
  professionals: ProfessionalRepository;
  treatments: TreatmentRepository;
  appointments: AppointmentRepository;
  leads: LeadRepository;
  records: ClinicalRecordRepository;
  plans: TreatmentPlanRepository;
  receivables: ReceivableRepository;
  expenses: ExpenseRepository;
  beforeAfter: BeforeAfterRepository;
  documents: DocumentRepository;
  notifications: NotificationRepository;
  siteContent: SiteContentRepository;
  settings: SettingsRepository;
}

export const repositories: Repositories = {
  patients: new DefaultPatientRepository(),
  professionals: new DefaultProfessionalRepository(),
  treatments: new DefaultTreatmentRepository(),
  appointments: new DefaultAppointmentRepository(),
  leads: new DefaultLeadRepository(),
  records: new DefaultClinicalRecordRepository(),
  plans: new DefaultTreatmentPlanRepository(),
  receivables: new DefaultReceivableRepository(),
  expenses: new DefaultExpenseRepository(),
  beforeAfter: new DefaultBeforeAfterRepository(),
  documents: new DefaultDocumentRepository(),
  notifications: new DefaultNotificationRepository(),
  siteContent: new DefaultSiteContentRepository(),
  settings: new DefaultSettingsRepository(),
};
