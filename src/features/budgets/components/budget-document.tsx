import { Logo } from "@/components/shared/brand";
import type { SiteContent } from "@/features/content/types";
import type { Patient } from "@/features/patients/types";
import type { Professional } from "@/features/professionals/types";
import type { ClinicSettings } from "@/features/settings/types";
import { cn } from "@/utils/cn";
import { formatCpf, formatCurrency, formatDate, formatPhone } from "@/utils/format";
import { itemTotal, planTotals } from "../service";
import type { TreatmentPlan } from "../types";

interface Props {
  plan: TreatmentPlan;
  patient?: Patient;
  professional?: Professional;
  settings?: ClinicSettings;
  content?: SiteContent;
  className?: string;
}

/** Documento de orçamento — mesmo layout em tela e na impressão (A4). */
export function BudgetDocument({ plan, patient, professional, settings, content, className }: Props) {
  const totals = planTotals(plan);
  const clinic = settings?.clinic;
  return (
    <article className={cn("print-area mx-auto w-full max-w-[794px] bg-white px-6 py-8 text-ink sm:px-12 sm:py-12", className)}>
      <header className="flex flex-col gap-6 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
        <Logo logoUrl={content?.logo} />
        <div className="text-[11.5px] leading-relaxed text-muted sm:text-right">
          <p className="font-semibold text-ink">{clinic?.legalName}</p>
          {clinic?.cnpj ? <p>CNPJ {clinic.cnpj}</p> : null}
          <p>{clinic?.address}</p>
          <p>
            {formatPhone(clinic?.phone)} · {clinic?.email}
          </p>
        </div>
      </header>

      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Plano de tratamento</p>
          <h2 className="mt-2 font-serif text-[28px] leading-tight">{plan.title}</h2>
        </div>
        <div className="text-[12px] text-muted sm:text-right">
          <p>
            Proposta <span className="font-semibold tabular text-ink">{plan.code}</span>
          </p>
          <p>Emitida em {formatDate(plan.updatedAt)}</p>
          <p>
            Válida até <span className="font-semibold text-ink">{formatDate(plan.validUntil)}</span>
          </p>
        </div>
      </div>

      <section className="mt-6 grid gap-4 rounded-[12px] bg-ivory p-4 text-[12.5px] sm:grid-cols-2">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-subtle">Paciente</p>
          <p className="mt-1 text-[14px] font-semibold">{patient?.name ?? "—"}</p>
          <p className="text-muted">
            {patient?.cpf ? `CPF ${formatCpf(patient.cpf)} · ` : ""}
            {formatPhone(patient?.phone)}
          </p>
        </div>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-subtle">Profissional responsável</p>
          <p className="mt-1 text-[14px] font-semibold">{professional ? `${professional.title} ${professional.name}` : "—"}</p>
          <p className="text-muted">
            {professional?.specialty} {professional?.cro ? `· ${professional.cro}` : ""}
          </p>
        </div>
      </section>

      <table className="mt-6 w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b border-ink text-left text-[10.5px] uppercase tracking-[0.1em] text-subtle">
            <th className="py-2 pr-2 font-semibold">Procedimento</th>
            <th className="hidden py-2 pr-2 font-semibold sm:table-cell">Dente / região</th>
            <th className="py-2 pr-2 text-right font-semibold">Qtd.</th>
            <th className="hidden py-2 pr-2 text-right font-semibold sm:table-cell">Valor unit.</th>
            <th className="py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {plan.items
            .filter((i) => i.procedure.trim())
            .map((i) => (
              <tr key={i.id} className="border-b border-line align-top">
                <td className="py-2.5 pr-2">
                  <p className="font-medium">{i.procedure}</p>
                  <p className="text-[11.5px] text-subtle sm:hidden">{i.region}</p>
                  {i.discount ? <p className="text-[11px] text-success">Desconto de {formatCurrency(i.discount)}</p> : null}
                </td>
                <td className="hidden py-2.5 pr-2 text-muted sm:table-cell">{i.region || "—"}</td>
                <td className="py-2.5 pr-2 text-right tabular">{i.quantity}</td>
                <td className="hidden py-2.5 pr-2 text-right tabular sm:table-cell">{formatCurrency(i.unitPrice)}</td>
                <td className="py-2.5 text-right font-medium tabular">{formatCurrency(itemTotal(i))}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <dl className="w-full max-w-[280px] space-y-1.5 text-[12.5px]">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular">{formatCurrency(totals.subtotal)}</dd>
          </div>
          {totals.discount ? (
            <div className="flex justify-between text-success">
              <dt>Descontos</dt>
              <dd className="tabular">− {formatCurrency(totals.discount)}</dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between border-t border-ink pt-2">
            <dt className="font-semibold">Total</dt>
            <dd className="font-serif text-[24px] tabular">{formatCurrency(totals.total)}</dd>
          </div>
        </dl>
      </div>

      <section className="mt-8 grid gap-6 text-[12.5px] sm:grid-cols-2">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-subtle">Formas de pagamento</p>
          <p className="mt-1.5 leading-relaxed text-ink-2">{plan.paymentTerms || settings?.finance.defaultPaymentTerms}</p>
        </div>
        {plan.notes ? (
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-subtle">Observações</p>
            <p className="mt-1.5 leading-relaxed text-ink-2">{plan.notes}</p>
          </div>
        ) : null}
      </section>

      <footer className="mt-12 grid gap-10 pt-6 text-[11.5px] text-muted sm:grid-cols-2">
        <div className="border-t border-line-strong pt-2 text-center">Assinatura do paciente</div>
        <div className="border-t border-line-strong pt-2 text-center">{professional ? `${professional.title} ${professional.name}` : "Profissional responsável"}</div>
      </footer>
      <p className="mt-8 text-center text-[10.5px] text-subtle">
        Valores sujeitos a reavaliação clínica. Proposta válida até {formatDate(plan.validUntil)}.
      </p>
    </article>
  );
}
