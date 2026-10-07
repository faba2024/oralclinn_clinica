import { Badge } from "@/components/ui/badge";
import type { Tone } from "@/types/common";
import { PATIENT_STATUS_LABELS, type PatientStatus } from "../types";

const TONES: Record<PatientStatus, Tone> = {
  novo: "gold",
  ativo: "success",
  "em-tratamento": "info",
  inativo: "neutral",
};

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  return <Badge tone={TONES[status]}>{PATIENT_STATUS_LABELS[status]}</Badge>;
}
