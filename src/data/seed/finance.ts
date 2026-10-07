import { addMonths, format, setDate, subMonths } from "date-fns";
import type { Expense, ExpenseCategory, Installment, Receivable } from "@/features/finance/types";
import type { PaymentMethod } from "@/types/common";
import { createRandom, dayOffset, isoOffset } from "./helpers";

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

function installments(
  prefix: string,
  total: number,
  count: number,
  firstDue: Date,
  paidUntil: Date,
  method: PaymentMethod,
): Installment[] {
  const base = Math.floor((total / count) * 100) / 100;
  return Array.from({ length: count }, (_, i) => {
    const due = addMonths(firstDue, i);
    const amount = i === count - 1 ? Math.round((total - base * (count - 1)) * 100) / 100 : base;
    const paid = due <= paidUntil;
    return { id: `${prefix}_${i + 1}`, number: i + 1, dueDate: fmt(due), amount, paidAt: paid ? fmt(due) : null, method };
  });
}

/** Lançamentos ligados aos planos de tratamento dos pacientes principais. */
function planReceivables(): Receivable[] {
  const now = new Date();
  const created = isoOffset(-120);
  const make = (
    id: string,
    patientId: string,
    treatmentId: string,
    professionalId: string,
    planId: string | null,
    description: string,
    total: number,
    count: number,
    firstDue: Date,
    paidUntil: Date,
    method: PaymentMethod,
  ): Receivable => ({
    id,
    patientId,
    treatmentId,
    professionalId,
    planId,
    description,
    method,
    installments: installments(id, total, count, firstDue, paidUntil, method),
    createdAt: created,
    updatedAt: created,
  });

  return [
    make("rec_mariana", "pac_mariana", "trt_facetas", "prof_camila", "plan_mariana", "Facetas em resina — arcada superior", 14400, 6, subMonths(now, 3), now, "credito"),
    make("rec_joao", "pac_joao", "trt_implante", "prof_lucas", "plan_joao", "Implante 36 + coroa", 8700, 5, subMonths(now, 2), subMonths(now, 1), "boleto"),
    make("rec_fernanda", "pac_fernanda", "trt_alinhadores", "prof_camila", "plan_fernanda", "Alinhadores — tratamento completo", 9800, 10, subMonths(now, 4), now, "credito"),
    make("rec_helena", "pac_helena", "trt_implante", "prof_lucas", "plan_helena", "Reabilitação inferior — entrada", 6000, 3, setDate(subMonths(now, 1), 5), setDate(subMonths(now, 1), 5), "pix"),
    make("rec_rafael", "pac_rafael", "trt_endodontia", "prof_lucas", null, "Endodontia 46", 950, 2, subMonths(now, 1), subMonths(now, 2), "pix"),
    make("rec_larissa", "pac_larissa", "trt_alinhadores", "prof_camila", null, "Alinhadores — entrada e parcelas", 8900, 8, subMonths(now, 1), now, "credito"),
  ];
}

const avulsos: { treatmentId: string; professionalId: string; description: string; values: number[] }[] = [
  { treatmentId: "trt_limpeza", professionalId: "prof_camila", description: "Profilaxia", values: [250] },
  { treatmentId: "trt_restauracao", professionalId: "prof_camila", description: "Restauração em resina", values: [280, 560, 840] },
  { treatmentId: "trt_clareamento", professionalId: "prof_camila", description: "Clareamento combinado", values: [1200] },
  { treatmentId: "trt_facetas", professionalId: "prof_camila", description: "Facetas em resina", values: [3600, 5400, 7200] },
  { treatmentId: "trt_lentes", professionalId: "prof_camila", description: "Lentes de contato dental", values: [8800, 13200] },
  { treatmentId: "trt_implante", professionalId: "prof_lucas", description: "Implante unitário", values: [3500, 4200] },
  { treatmentId: "trt_protese", professionalId: "prof_lucas", description: "Prótese fixa", values: [2800, 3400] },
  { treatmentId: "trt_endodontia", professionalId: "prof_lucas", description: "Tratamento de canal", values: [950, 1200] },
  { treatmentId: "trt_ortodontia", professionalId: "prof_camila", description: "Manutenção ortodôntica", values: [220] },
  { treatmentId: "trt_harmonizacao", professionalId: "prof_camila", description: "Harmonização orofacial", values: [1400, 2800] },
  { treatmentId: "trt_periodontia", professionalId: "prof_lucas", description: "Raspagem periodontal", values: [600, 1200] },
];

const patientPool = [
  "pac_mariana", "pac_joao", "pac_fernanda", "pac_carlos", "pac_ana", "pac_rafael", "pac_juliana",
  "pac_pedro", "pac_larissa", "pac_gustavo", "pac_helena", "pac_thiago", "pac_patricia",
];
const methods: PaymentMethod[] = ["pix", "pix", "credito", "credito", "debito", "dinheiro", "transferencia"];

/** Receitas avulsas dos últimos 6 meses. */
function monthlyReceivables(): Receivable[] {
  const rand = createRandom(77);
  const result: Receivable[] = [];
  for (let back = 5; back >= 0; back--) {
    const month = subMonths(new Date(), back);
    const full = rand.int(11, 16) + (5 - back);
    // Mês corrente: volume proporcional aos dias já decorridos.
    const count = back === 0 ? Math.max(2, Math.round((full * new Date().getDate()) / 30)) : full;
    for (let i = 0; i < count; i++) {
      const item = rand.pick(avulsos);
      const value = rand.pick(item.values);
      const maxDay = back === 0 ? Math.max(1, new Date().getDate()) : 28;
      const day = rand.int(1, maxDay);
      const due = setDate(month, day);
      const method = rand.pick(methods);
      const id = `rec_m${back}_${i}`;
      const pending = back === 0 && rand.next() < 0.18;
      const created = due.toISOString();
      result.push({
        id,
        patientId: rand.pick(patientPool),
        treatmentId: item.treatmentId,
        professionalId: item.professionalId,
        planId: null,
        description: item.description,
        method,
        installments: [{ id: `${id}_1`, number: 1, dueDate: fmt(due), amount: value, paidAt: pending ? null : fmt(due), method }],
        createdAt: created,
        updatedAt: created,
      });
    }
  }
  return result;
}

/** Algumas parcelas atrasadas para a demonstração da inadimplência. */
function overdue(): Receivable[] {
  const created = isoOffset(-60);
  return [
    {
      id: "rec_carlos",
      patientId: "pac_carlos",
      treatmentId: "trt_protese",
      professionalId: "prof_lucas",
      planId: null,
      description: "Prótese parcial removível",
      method: "boleto",
      installments: [
        { id: "rec_carlos_1", number: 1, dueDate: dayOffset(-48), amount: 1100, paidAt: dayOffset(-48), method: "boleto" },
        { id: "rec_carlos_2", number: 2, dueDate: dayOffset(-18), amount: 1100, paidAt: null, method: "boleto" },
        { id: "rec_carlos_3", number: 3, dueDate: dayOffset(12), amount: 1100, paidAt: null, method: "boleto" },
      ],
      createdAt: created,
      updatedAt: created,
    },
    {
      id: "rec_pedro",
      patientId: "pac_pedro",
      treatmentId: "trt_periodontia",
      professionalId: "prof_lucas",
      planId: null,
      description: "Tratamento periodontal",
      method: "pix",
      installments: [
        { id: "rec_pedro_1", number: 1, dueDate: dayOffset(-9), amount: 600, paidAt: null, method: "pix" },
        { id: "rec_pedro_2", number: 2, dueDate: dayOffset(21), amount: 600, paidAt: null, method: "pix" },
      ],
      createdAt: created,
      updatedAt: created,
    },
    {
      id: "rec_gustavo",
      patientId: "pac_gustavo",
      treatmentId: "trt_clareamento",
      professionalId: "prof_camila",
      planId: null,
      description: "Clareamento caseiro supervisionado",
      method: "pix",
      installments: [{ id: "rec_gustavo_1", number: 1, dueDate: dayOffset(2), amount: 900, paidAt: null, method: "pix" }],
      createdAt: created,
      updatedAt: created,
    },
  ];
}

export function seedReceivables(): Receivable[] {
  return [...planReceivables(), ...monthlyReceivables(), ...overdue()];
}

const fixedExpenses: { category: ExpenseCategory; description: string; supplier: string; amount: [number, number]; day: number; method: PaymentMethod }[] = [
  { category: "aluguel", description: "Aluguel do imóvel", supplier: "Imobiliária Central", amount: [4800, 4800], day: 5, method: "transferencia" },
  { category: "funcionarios", description: "Folha de pagamento", supplier: "Equipe Oralclin", amount: [12500, 12900], day: 5, method: "transferencia" },
  { category: "laboratorio", description: "Serviços de prótese e cerâmica", supplier: "Lab. Dental Arte", amount: [3200, 5600], day: 12, method: "boleto" },
  { category: "material", description: "Materiais de consumo", supplier: "Dental Cremer", amount: [2100, 3600], day: 15, method: "boleto" },
  { category: "marketing", description: "Gestão de tráfego e conteúdo", supplier: "Agência Lume", amount: [1800, 1800], day: 10, method: "pix" },
  { category: "outros", description: "Energia, água e internet", supplier: "Concessionárias", amount: [980, 1350], day: 20, method: "debito" },
];

export function seedExpenses(): Expense[] {
  const rand = createRandom(99);
  const result: Expense[] = [];
  for (let back = 5; back >= 0; back--) {
    const month = subMonths(new Date(), back);
    fixedExpenses.forEach((e, i) => {
      const date = setDate(month, e.day);
      const isFuture = date > new Date();
      result.push({
        id: `exp_${back}_${i}`,
        category: e.category,
        description: e.description,
        supplier: e.supplier,
        amount: rand.int(e.amount[0], e.amount[1]),
        date: fmt(date),
        method: e.method,
        paid: !isFuture,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      });
    });
  }
  const eqDate = subMonths(new Date(), 2);
  result.push({
    id: "exp_scanner",
    category: "equipamentos",
    description: "Scanner intraoral — parcela",
    supplier: "Dentsply Sirona",
    amount: 3900,
    date: fmt(setDate(eqDate, 18)),
    method: "credito",
    paid: true,
    createdAt: eqDate.toISOString(),
    updatedAt: eqDate.toISOString(),
  });
  return result;
}
