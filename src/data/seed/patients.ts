import { addDays, format } from "date-fns";
import type { Patient } from "@/features/patients/types";
import type { LeadSource } from "@/types/common";
import { stamp } from "./helpers";

/** Gera data de nascimento cujo aniversário cai daqui a `offset` dias. */
function birthday(offset: number, year: number): string {
  const d = addDays(new Date(), offset);
  return `${year}-${format(d, "MM-dd")}`;
}

type Row = [
  id: string,
  name: string,
  phone: string,
  email: string,
  cpf: string,
  birth: string,
  gender: Patient["gender"],
  prof: string,
  status: Patient["status"],
  origin: LeadSource,
  createdOffset: number,
  notes: string,
  occupation: string,
];

const rows: Row[] = [
  ["pac_mariana", "Mariana Costa", "77991234501", "mariana.costa@email.com", "41823957060", "1991-03-14", "feminino", "prof_camila", "em-tratamento", "instagram", -150, "Prefere atendimentos no fim da tarde. Sensibilidade leve ao frio.", "Arquiteta"],
  ["pac_joao", "João Henrique Barros", "77991234502", "joao.henrique@email.com", "52739184022", birthday(0, 1984), "masculino", "prof_lucas", "em-tratamento", "indicacao", -132, "Hipertenso controlado. Confirmar uso de medicação antes de procedimentos cirúrgicos.", "Engenheiro agrônomo"],
  ["pac_fernanda", "Fernanda Oliveira", "77991234503", "fernanda.oliveira@email.com", "63918275033", "1996-09-02", "feminino", "prof_camila", "em-tratamento", "google", -118, "Usa alinhadores — fase 9 de 22.", "Advogada"],
  ["pac_carlos", "Carlos Mendes", "77991234504", "carlos.mendes@email.com", "74028361044", birthday(3, 1972), "masculino", "prof_lucas", "ativo", "whatsapp", -170, "Ansiedade odontológica — explicar cada etapa antes de iniciar.", "Comerciante"],
  ["pac_ana", "Ana Luísa Prado", "77991234505", "ana.prado@email.com", "85137492055", "2000-11-21", "feminino", "prof_camila", "ativo", "instagram", -96, "", "Estudante de medicina"],
  ["pac_rafael", "Rafael Souza Lima", "77991234506", "rafael.lima@email.com", "96240513066", "1988-06-30", "masculino", "prof_lucas", "em-tratamento", "site", -80, "Alérgico a dipirona.", "Analista de sistemas"],
  ["pac_juliana", "Juliana Ribeiro", "77991234507", "juliana.ribeiro@email.com", "17359624077", birthday(5, 1993), "feminino", "prof_camila", "ativo", "indicacao", -64, "", "Designer"],
  ["pac_pedro", "Pedro Almeida", "77991234508", "pedro.almeida@email.com", "28460735088", "1979-01-17", "masculino", "prof_lucas", "ativo", "facebook", -58, "Diabético tipo 2.", "Produtor rural"],
  ["pac_larissa", "Larissa Moura", "77991234509", "larissa.moura@email.com", "39571846099", "1998-04-08", "feminino", "prof_camila", "em-tratamento", "instagram", -45, "", "Fisioterapeuta"],
  ["pac_gustavo", "Gustavo Teixeira", "77991234510", "gustavo.teixeira@email.com", "40682957010", "1985-08-25", "masculino", "prof_camila", "ativo", "google", -38, "", "Médico veterinário"],
  ["pac_helena", "Helena Martins", "77991234511", "helena.martins@email.com", "51793068021", "1962-12-03", "feminino", "prof_lucas", "em-tratamento", "indicacao", -30, "Usa anticoagulante — avaliar com cardiologista antes de cirurgia.", "Professora aposentada"],
  ["pac_thiago", "Thiago Nunes", "77991234512", "thiago.nunes@email.com", "62804179032", "1990-02-11", "masculino", "prof_camila", "ativo", "campanha", -24, "", "Empresário"],
  ["pac_camila_r", "Camila Rocha", "77991234513", "camila.rocha@email.com", "73915280043", "1995-07-19", "feminino", "prof_camila", "novo", "instagram", -12, "", "Jornalista"],
  ["pac_bruno", "Bruno Carvalho", "77991234514", "bruno.carvalho@email.com", "84026391054", "1982-10-09", "masculino", "prof_lucas", "novo", "google", -8, "", "Contador"],
  ["pac_patricia", "Patrícia Gomes", "77991234515", "patricia.gomes@email.com", "95137402065", "1975-05-27", "feminino", "prof_camila", "inativo", "outro", -175, "Mudou-se para Salvador.", "Servidora pública"],
  ["pac_lucas_m", "Lucas Martins", "77991234516", "lucas.martins@email.com", "16248513076", "2003-09-15", "masculino", "prof_camila", "novo", "site", -3, "", "Estudante"],
];

export function seedPatients(): Patient[] {
  return rows.map(([id, name, phone, email, cpf, birthDate, gender, prof, status, origin, offset, notes, occupation]) => ({
    id,
    name,
    phone,
    email,
    cpf,
    birthDate,
    gender,
    address: "",
    occupation,
    responsibleProfessionalId: prof,
    status,
    origin,
    importantNotes: notes,
    tags: [],
    ...stamp(offset),
  }));
}
