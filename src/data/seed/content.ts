import { IMAGES } from "@/data/images";
import type { SiteContent } from "@/features/content/types";

export function seedSiteContent(): SiteContent {
  return {
    logo: null,
    brandName: "Oralclin",
    brandTagline: "Odontologia e Saúde",
    heroEyebrow: "Odontologia estética e reabilitação",
    heroTitle: "Seu sorriso merece um novo capítulo.",
    heroSubtitle:
      "Uma mega estrutura com especialistas, tecnologia digital e um cuidado que começa na escuta. Planejamos cada detalhe com você.",
    heroImage: IMAGES.hero,
    heroHighlights: ["Odontologia, fonoaudiologia e ginecologia", "Especialistas em cada área", "Atendimento humanizado"],
    clinicTitle: "Uma estrutura pensada para o seu conforto.",
    clinicText:
      "A Oralclin reúne odontologia, fonoaudiologia e ginecologia em um só lugar, no centro de Rio do Pires. Ambiente acolhedor e uma equipe que acompanha cada etapa do cuidado — da primeira avaliação ao último retorno.",
    clinicImage: IMAGES.clinic,
    clinicStats: [
      { id: "st1", value: "3", label: "áreas da saúde integradas" },
      { id: "st2", value: "4", label: "profissionais especialistas" },
      { id: "st3", value: "100%", label: "planejamento personalizado" },
    ],
    ctaTitle: "Comece pela avaliação.",
    ctaText: "Em uma conversa sem pressa, entendemos o que você deseja e mostramos os caminhos possíveis.",
    testimonials: [],
    phone: "77981636419",
    whatsapp: "77981636419",
    email: "",
    instagram: "oralclinrp",
    address: "Rua José Joaquim de Souza — Centro",
    city: "Rio do Pires - BA",
    mapsUrl: "https://maps.google.com/?q=Oralclin+Rua+Jos%C3%A9+Joaquim+de+Souza+Rio+do+Pires+BA",
    hours: [
      { id: "h1", label: "Segunda a sexta", hours: "08h às 19h" },
      { id: "h2", label: "Sábado", hours: "08h às 12h" },
    ],
    seoTitle: "Oralclin | Odontologia e Saúde",
    seoDescription:
      "Odontologia estética, implantes, alinhadores e reabilitação oral com planejamento digital e atendimento humanizado. Agende sua avaliação.",
  };
}
