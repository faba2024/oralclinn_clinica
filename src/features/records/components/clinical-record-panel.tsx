"use client";

import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClinicalRecord } from "../hooks";
import { AnamnesisForm } from "./anamnesis-form";
import { EvolutionTimeline } from "./evolution-timeline";
import { Odontogram } from "./odontogram";

/** Prontuário completo de um paciente: anamnese, odontograma e evolução. */
export function ClinicalRecordPanel({ patientId }: { patientId: string }) {
  const { data: record, loading } = useClinicalRecord(patientId);

  if (loading && record === undefined) {
    return <Skeleton className="h-[480px] w-full" />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <AnamnesisForm patientId={patientId} record={record ?? null} />
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <h3 className="mb-4 text-[14px] font-semibold">Odontograma</h3>
          <Odontogram patientId={patientId} odontogram={record?.odontogram ?? {}} />
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <EvolutionTimeline patientId={patientId} evolutions={record?.evolutions ?? []} />
        </CardBody>
      </Card>
    </div>
  );
}
