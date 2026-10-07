import type { Metadata } from "next";
import { PageHero } from "@/components/site/section-heading";
import { TreatmentsCatalog } from "@/features/site/components/treatments-catalog";

export const metadata: Metadata = {
  title: "Tratamentos",
  description: "Facetas, lentes de contato dental, implantes, clareamento, alinhadores invisíveis e mais. Conheça os tratamentos da Oralclin.",
  alternates: { canonical: "/tratamentos" },
};

export default function TreatmentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Tratamentos"
        title="Odontologia completa, planejada para você."
        description="Da prevenção à reabilitação estética, cada tratamento começa com uma avaliação cuidadosa e um plano transparente."
      />
      <TreatmentsCatalog />
    </>
  );
}
