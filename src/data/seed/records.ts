import type { ClinicalRecord, ToothRecord } from "@/features/records/types";
import { dayOffset, stamp } from "./helpers";

const teeth = (entries: Record<string, ToothRecord["state"]>) =>
  Object.fromEntries(Object.entries(entries).map(([k, state]) => [k, { state }])) as Record<string, ToothRecord>;

export function seedRecords(): ClinicalRecord[] {
  return [
    {
      id: "rec_clin_mariana",
      patientId: "pac_mariana",
      chiefComplaint: "Insatisfação com a cor e o formato dos dentes anteriores superiores.",
      medicalHistory: "Sem alterações sistêmicas relatadas.",
      allergies: "Nenhuma conhecida.",
      medications: "Anticoncepcional oral.",
      conditions: "Sensibilidade dentinária leve ao frio.",
      clinicalNotes: "Linha do sorriso média. Bruxismo leve em vigília — orientada sobre placa de proteção.",
      therapeuticPlan: "Clareamento prévio seguido de 8 facetas em resina (13 a 23). Placa miorrelaxante ao final.",
      odontogram: teeth({ "13": "planejado", "12": "concluido", "11": "concluido", "21": "concluido", "22": "concluido", "23": "planejado", "36": "restauracao", "46": "restauracao" }),
      evolutions: [
        { id: "evo_m1", date: dayOffset(-84), professionalId: "prof_camila", procedure: "Avaliação e fotografias", teeth: "—", description: "Avaliação estética, protocolo fotográfico e escaneamento para planejamento digital." },
        { id: "evo_m2", date: dayOffset(-63), professionalId: "prof_camila", procedure: "Clareamento de consultório", teeth: "Arcadas", description: "Sessão única de clareamento em consultório. Sensibilidade controlada com dessensibilizante." },
        { id: "evo_m3", date: dayOffset(-21), professionalId: "prof_camila", procedure: "Facetas em resina", teeth: "11, 21", description: "Confecção das facetas em resina nos incisivos centrais. Ajuste oclusal realizado." },
        { id: "evo_m4", date: dayOffset(0), professionalId: "prof_camila", procedure: "Facetas em resina", teeth: "12, 22", description: "Facetas nos incisivos laterais. Paciente satisfeita com forma e cor." },
      ],
      ...stamp(-84),
    },
    {
      id: "rec_clin_joao",
      patientId: "pac_joao",
      chiefComplaint: "Ausência do primeiro molar inferior esquerdo, dificuldade para mastigar.",
      medicalHistory: "Hipertensão arterial controlada.",
      allergies: "Nenhuma conhecida.",
      medications: "Losartana 50 mg/dia.",
      conditions: "Hipertensão controlada — aferir pressão antes de procedimentos.",
      clinicalNotes: "Boa espessura óssea na região do 36 segundo tomografia.",
      therapeuticPlan: "Implante na região do 36 com coroa sobre implante após osseointegração.",
      odontogram: teeth({ "36": "implante", "37": "restauracao", "16": "coroa", "26": "restauracao" }),
      evolutions: [
        { id: "evo_j1", date: dayOffset(-60), professionalId: "prof_lucas", procedure: "Avaliação + tomografia", teeth: "36", description: "Solicitada tomografia de mandíbula. Planejamento cirúrgico iniciado." },
        { id: "evo_j2", date: dayOffset(0), professionalId: "prof_lucas", procedure: "Instalação de implante", teeth: "36", description: "Implante instalado com travamento adequado. Orientações pós-operatórias entregues." },
      ],
      ...stamp(-60),
    },
    {
      id: "rec_clin_fernanda",
      patientId: "pac_fernanda",
      chiefComplaint: "Apinhamento anterior inferior e diastema superior.",
      medicalHistory: "Sem alterações.",
      allergies: "Látex.",
      medications: "—",
      conditions: "Alergia ao látex — utilizar luvas nitrílicas.",
      clinicalNotes: "Boa colaboração no uso dos alinhadores (22h/dia).",
      therapeuticPlan: "22 alinhadores, troca a cada 14 dias. Contenção ao final.",
      odontogram: teeth({ "11": "planejado", "21": "planejado", "31": "planejado", "41": "planejado", "18": "ausente", "28": "ausente" }),
      evolutions: [
        { id: "evo_f1", date: dayOffset(-112), professionalId: "prof_camila", procedure: "Escaneamento intraoral", teeth: "Arcadas", description: "Escaneamento e envio para planejamento." },
        { id: "evo_f2", date: dayOffset(-98), professionalId: "prof_camila", procedure: "Instalação de attachments", teeth: "13, 23, 33, 43", description: "Attachments instalados e entrega dos alinhadores 1 a 3." },
        { id: "evo_f3", date: dayOffset(0), professionalId: "prof_camila", procedure: "Acompanhamento", teeth: "—", description: "Encaixe adequado. Entregues os alinhadores 10 a 12." },
      ],
      ...stamp(-112),
    },
  ];
}
