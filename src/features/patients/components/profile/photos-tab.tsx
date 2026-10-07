"use client";

import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { BeforeAfterSlider } from "@/features/before-after/components/before-after-slider";
import { useBeforeAfter } from "@/features/before-after/hooks";
import { DocumentsPanel } from "@/features/documents/components/documents-panel";

export function PhotosTab({ patientId }: { patientId: string }) {
  const { data: cases = [] } = useBeforeAfter();
  const own = cases.filter((c) => c.patientId === patientId);
  return (
    <div className="space-y-4">
      <DocumentsPanel patientId={patientId} imagesOnly />
      {own.length ? (
        <Card>
          <CardHeader
            title="Antes e depois"
            description="Casos vinculados a este paciente"
            action={<Link href="/admin/antes-depois" className="text-[12.5px] font-medium text-gold-dark hover:underline">Gerenciar</Link>}
          />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            {own.map((c) => (
              <div key={c.id}>
                <BeforeAfterSlider before={c.beforeImage} after={c.afterImage} alt={c.title} />
                <p className="mt-2 text-[13px] font-medium">{c.title}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
