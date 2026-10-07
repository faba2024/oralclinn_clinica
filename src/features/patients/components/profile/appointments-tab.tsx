"use client";

import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { AppointmentDrawer } from "@/features/appointments/components/appointment-drawer";
import { AppointmentFormDialog } from "@/features/appointments/components/appointment-form-dialog";
import { AppointmentStatusBadge } from "@/features/appointments/components/status-badge";
import { usePatientAppointments } from "@/features/appointments/hooks";
import type { Appointment } from "@/features/appointments/types";
import { useLookups } from "@/hooks/use-lookups";
import { formatCurrency, formatDate } from "@/utils/format";

export function AppointmentsTab({ patientId }: { patientId: string }) {
  const lookups = useLookups();
  const { data = [] } = usePatientAppointments(patientId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const selected = data.find((a) => a.id === selectedId) ?? null;

  const columns: Column<Appointment>[] = [
    { key: "date", header: "Data", sortValue: (a) => `${a.date}${a.start}`, cell: (a) => <span className="whitespace-nowrap tabular font-medium">{formatDate(a.date)} · {a.start}</span> },
    { key: "trt", header: "Procedimento", cell: (a) => lookups.treatmentName(a.treatmentId) },
    { key: "prof", header: "Profissional", cell: (a) => <span className="whitespace-nowrap">{lookups.professionalName(a.professionalId)}</span> },
    { key: "room", header: "Sala", cell: (a) => <span className="text-muted">{a.room}</span> },
    { key: "status", header: "Status", cell: (a) => <AppointmentStatusBadge status={a.status} /> },
    { key: "price", header: "Valor", align: "right", sortValue: (a) => a.price, cell: (a) => <span className="tabular">{a.price ? formatCurrency(a.price) : "—"}</span> },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line p-4">
        <p className="text-[14px] font-semibold">
          {data.length} consulta{data.length === 1 ? "" : "s"}
        </p>
        <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
          <CalendarPlus /> Agendar
        </Button>
      </div>
      <DataTable
        rows={data}
        columns={columns}
        getRowId={(a) => a.id}
        onRowClick={(a) => setSelectedId(a.id)}
        initialSort={{ key: "date", dir: "desc" }}
        empty={<EmptyState title="Nenhuma consulta" description="Agende o primeiro atendimento deste paciente." />}
        mobileCard={(a) => (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium">{lookups.treatmentName(a.treatmentId)}</p>
              <p className="text-[12px] tabular text-subtle">
                {formatDate(a.date)} · {a.start}
              </p>
            </div>
            <AppointmentStatusBadge status={a.status} />
          </div>
        )}
      />
      <AppointmentDrawer
        appointment={selected}
        onClose={() => setSelectedId(null)}
        onEdit={(a) => {
          setSelectedId(null);
          setEditing(a);
          setFormOpen(true);
        }}
      />
      <AppointmentFormDialog open={formOpen} onClose={() => setFormOpen(false)} appointment={editing} defaults={{ patientId }} />
    </Card>
  );
}
