import type { Metadata } from "next";
import { PageHero } from "@/components/site/section-heading";
import { ClinicPage } from "@/features/site/components/clinic-page";

export const metadata: Metadata = {
  title: "A clínica",
  description: "Estrutura completa, tecnologia digital e atendimento humanizado. Conheça a Oralclin.",
  alternates: { canonical: "/clinica" },
};

export default function ClinicPublicPage() {
  return (
    <>
      <PageHero eyebrow="A clínica" title="Uma mega estrutura para cuidar de você." description="Odontologia e saúde integradas em um ambiente pensado para o seu conforto." />
      <ClinicPage />
    </>
  );
}
