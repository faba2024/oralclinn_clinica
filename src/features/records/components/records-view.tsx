"use client";

import { ArrowLeft, ClipboardList, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { usePatients } from "@/features/patients/hooks";
import { cn } from "@/utils/cn";
import { calculateAge, formatDate, matchesSearch } from "@/utils/format";
import { useClinicalRecords } from "../hooks";
import { ClinicalRecordPanel } from "./clinical-record-panel";

export function RecordsView() {
  const { data: patients = [] } = usePatients();
  const { data: records = [] } = useClinicalRecords();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const recordByPatient = useMemo(() => new Map(records.map((r) => [r.patientId, r])), [records]);
  const list = useMemo(
    () =>
      patients
        .filter((p) => matchesSearch(query, p.name, p.cpf, p.phone))
        .sort((a, b) => {
          const ra = recordByPatient.get(a.id)?.updatedAt ?? "";
          const rb = recordByPatient.get(b.id)?.updatedAt ?? "";
          return rb.localeCompare(ra) || a.name.localeCompare(b.name, "pt-BR");
        }),
    [patients, query, recordByPatient],
  );
  const selected = patients.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Prontuários" description="Anamnese, odontograma e evolução clínica de cada paciente." />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className={cn("overflow-hidden", selected && "hidden lg:block")}>
          <div className="border-b border-line p-3">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar paciente" leading={<Search />} aria-label="Buscar paciente" />
          </div>
          <ul className="scrollbar-thin max-h-[70dvh] overflow-y-auto p-1.5">
            {list.map((p) => {
              const r = recordByPatient.get(p.id);
              const age = calculateAge(p.birthDate);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    aria-current={selectedId === p.id}
                    className={cn("flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-left transition-colors", selectedId === p.id ? "bg-sand" : "hover:bg-ivory")}
                  >
                    <Avatar name={p.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium">{p.name}</span>
                      <span className="block truncate text-[11.5px] text-subtle">
                        {age !== null ? `${age} anos · ` : ""}
                        {r ? `${r.evolutions.length} evoluções · atualizado ${formatDate(r.updatedAt, "dd/MM")}` : "Sem prontuário"}
                      </span>
                    </span>
                    {r ? <span className="size-1.5 rounded-full bg-gold" aria-label="Possui prontuário" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className={cn(!selected && "hidden lg:block")}>
          {selected ? (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setSelectedId(null)} className="rounded-lg p-1.5 text-muted hover:bg-sand lg:hidden" aria-label="Voltar à lista">
                    <ArrowLeft className="size-4" />
                  </button>
                  <Avatar name={selected.name} />
                  <div>
                    <p className="text-[15px] font-semibold">{selected.name}</p>
                    <p className="text-[12px] text-subtle">Prontuário clínico</p>
                  </div>
                </div>
                <Link href={`/admin/pacientes/${selected.id}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                  <ExternalLink /> Perfil completo
                </Link>
              </div>
              <ClinicalRecordPanel patientId={selected.id} />
            </div>
          ) : (
            <Card>
              <EmptyState icon={<ClipboardList />} title="Selecione um paciente" description="Escolha um paciente na lista para visualizar ou registrar o prontuário." />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
