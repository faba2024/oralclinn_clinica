import type { Professional } from "@/features/professionals/types";
import { IMAGES } from "@/data/images";
import { stamp } from "./helpers";

const weekdays = (start: string, end: string, days = [1, 2, 3, 4, 5]) =>
  days.map((weekday) => ({ weekday, start, end }));

// Os IDs internos foram mantidos para preservar os vínculos dos dados de demonstração.
// Horários de atendimento são estimados: ajuste em Painel → Horários.
export function seedProfessionals(): Professional[] {
  return [
    {
      id: "prof_lucas",
      photo: IMAGES.professionals.prof_lucas,
      title: "Dr.",
      name: "Marlon Mendonça",
      cro: "CRO 16888",
      specialty: "Cirurgião-dentista",
      phone: "77981636419",
      email: "",
      bio: "Cirurgião-dentista com atuação em endodontia automatizada, exodontia de siso, prótese em geral, restauração, gengivoplastia, raspagem, limpeza e clareamento.",
      color: "#4F6A80",
      workingHours: weekdays("08:00", "18:00", [1, 2, 3, 4, 5, 6]),
      treatmentIds: ["trt_endodontia", "trt_exodontia", "trt_protese", "trt_restauracao", "trt_periodontia", "trt_limpeza", "trt_clareamento", "trt_avaliacao"],
      status: "ativo",
      commissionRate: 0.4,
      showOnSite: true,
      ...stamp(-420),
    },
    {
      id: "prof_camila",
      photo: IMAGES.professionals.prof_camila,
      title: "Dra.",
      name: "Yasmim Cordeiro",
      cro: "",
      specialty: "Estética do sorriso",
      phone: "77981636419",
      email: "",
      bio: "Cirurgiã-dentista dedicada à estética do sorriso: lentes em resina estratificada e sua manutenção, profilaxia, restauração e clareamento.",
      color: "#B69A67",
      workingHours: weekdays("08:00", "18:00"),
      treatmentIds: ["trt_lentes", "trt_facetas", "trt_limpeza", "trt_restauracao", "trt_clareamento", "trt_avaliacao"],
      status: "ativo",
      commissionRate: 0.35,
      showOnSite: true,
      ...stamp(-420),
    },
    {
      id: "prof_beatriz",
      photo: IMAGES.professionals.prof_beatriz,
      title: "Fga.",
      name: "Karen Jully",
      cro: "CRFa 4-15600",
      specialty: "Fonoaudiologia",
      phone: "77981636419",
      email: "",
      bio: "Fonoaudióloga — consultas, avaliações e fonoterapia. Atende atrasos e transtornos de fala, linguagem e comunicação, intervenção precoce, TEA, transtornos do neurodesenvolvimento, síndromes genéticas e distúrbios miofuncionais orofaciais e de voz.",
      color: "#6E8B74",
      workingHours: weekdays("08:00", "18:00"),
      treatmentIds: ["trt_fonoaudiologia"],
      status: "ativo",
      commissionRate: 0.35,
      showOnSite: true,
      ...stamp(-300),
    },
    {
      id: "prof_gabriella",
      title: "Dra.",
      name: "Gabriella Fernandes",
      cro: "CRM 39531",
      specialty: "Ginecologia",
      phone: "77981636419",
      email: "",
      bio: "Ginecologista. Consulta ginecológica, ultrassonografia transvaginal, preventivo, tratamento da menopausa, inserção de implantes hormonais, DIU e Implanon.",
      color: "#9A6B7A",
      workingHours: weekdays("08:00", "17:00"),
      treatmentIds: ["trt_ginecologia"],
      status: "ativo",
      commissionRate: 0.35,
      showOnSite: true,
      ...stamp(-200),
    },
  ];
}
