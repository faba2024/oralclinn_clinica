import type { Metadata } from "next";
import { HomeHero, TreatmentsMarquee } from "@/features/site/components/home-hero";
import {
  BeforeAfterShowcase,
  ClinicShowcase,
  Faq,
  FinalCta,
  Journey,
  ProfessionalsShowcase,
  Testimonials,
  TreatmentsShowcase,
} from "@/features/site/components/home-sections";

export const metadata: Metadata = {
  title: { absolute: "Oralclin | Odontologia e Saúde" },
  description:
    "Odontologia estética, implantes, alinhadores e reabilitação oral com planejamento digital e atendimento humanizado. Agende sua avaliação.",
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: "Oralclin — Odontologia e Saúde",
  telephone: "+55 77 98163-6419",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua José Joaquim de Souza, Centro",
    addressLocality: "Rio do Pires",
    addressRegion: "BA",
    addressCountry: "BR",
  },
  url: "https://oralclin.com.br",
  sameAs: ["https://instagram.com/oralclinrp"],
  medicalSpecialty: ["Dentistry", "Gynecologic", "SpeechPathology"],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeHero />
      <TreatmentsMarquee />
      <TreatmentsShowcase />
      <Journey />
      <BeforeAfterShowcase />
      <ProfessionalsShowcase />
      <ClinicShowcase />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}
