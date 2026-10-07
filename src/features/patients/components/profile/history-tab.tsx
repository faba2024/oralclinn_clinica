"use client";

import { CalendarDays, ClipboardList, FileText, Paperclip, Wallet } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { usePatientAppointments } from "@/features/appointments/hooks";
import { APPOINTMENT_STATUS } from "@/features/appointments/types";
import { usePatientPlans } from "@/features/budgets/hooks";
import { PLAN_STATUS } from "@/features/budgets/types";
import { usePatientDocuments } from "@/features/documents/hooks";
import { DOCUMENT_CATEGORY_LABELS } from "@/features/documents/types";
import { usePatientReceivables } from "@/features/finance/hooks";
import { useClinicalRecord } from "@/features/records/hooks";
import { useLookups } from "@/hooks/use-lookups";
import { todayISO } from "@/utils/dates";
import { formatCurrency, formatDate } from "@/utils/format";

interface Event {
  id: string;
  date: string;
  icon: ReactNode;
  title: string;
  description: string;
}

/** Linha do tempo consolidada: consultas, evoluções, planos, pagamentos e arquivos. */
export function HistoryTab({ patientId }: { patientId: string }) {
  const lookups = useLookups();
  const { data: appointments = [] } = usePatientAppointments(patientId);
  const { data: plans = [] } = usePatientPlans(patientId);
  const { data: receivables = [] } = usePatientReceivables(patientId);
  const { data: documents = [] } = usePatientDocuments(patientId);
  const { data: record } = useClinicalRecord(patientId);

  const events = useMemo(() => {
    const today = todayISO();
    const list: Event[] = [];
    appointments
      .filter((a) => a.date <= today)
      .forEach((a) =>
        list.push({
          id: a.id,
          date: `${a.date}T${a.start}`,
          icon: <CalendarDays />,
          title: `${lookups.treatmentName(a.treatmentId)} — ${APPOINTMENT_STATUS[a.status].label}`,
          description: `${lookups.professionalName(a.professionalId)} · ${a.start} · ${a.room}`,
        }),
      );
    record?.evolutions.forEach((e) =>
      list.push({ id: e.id, date: `${e.date}T12:00`, icon: <ClipboardList />, title: `Evolução: ${e.procedure}`, description: e.description }),
    );
    plans.forEach((p) =>
      list.push({ id: p.id, date: p.createdAt, icon: <FileText />, title: `Plano ${p.code} — ${PLAN_STATUS[p.status].label}`, description: p.title }),
    );
    receivables.forEach((r) =>
      r.installments
        .filter((i) => i.paidAt)
        .forEach((i) =>
          list.push({ id: i.id, date: `${i.paidAt}T12:00`, icon: <Wallet />, title: `Pagamento recebido — ${formatCurrency(i.amount)}`, description: `${r.description} · parcela ${i.number}/${r.installments.length}` }),
        ),
    );
    documents.forEach((d) =>
      list.push({ id: d.id, date: d.createdAt, icon: <Paperclip />, title: `Arquivo anexado — ${DOCUMENT_CATEGORY_LABELS[d.category]}`, description: d.name }),
    );
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [appointments, plans, receivables, documents, record, lookups]);

  return (
    <Card>
      <CardBody>
        {events.length === 0 ? (
          <EmptyState title="Sem histórico" description="Os eventos do paciente aparecerão aqui." />
        ) : (
          <ol className="relative ml-3 border-l border-line">
            {events.slice(0, 80).map((e) => (
              <li key={e.id} className="relative pb-5 pl-7 last:pb-0">
                <span className="absolute -left-[13px] top-0 flex size-6 items-center justify-center rounded-full border border-line bg-white text-gold-dark [&_svg]:size-3">
                  {e.icon}
                </span>
                <p className="text-[13.5px] font-medium text-ink">{e.title}</p>
                <p className="text-[12.5px] text-muted">{e.description}</p>
                <p className="mt-0.5 text-[11.5px] tabular text-subtle">{formatDate(e.date, "dd/MM/yyyy")}</p>
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
