import type { Metadata } from "next";
import { PageHero } from "@/components/site/section-heading";
import { TeamGrid } from "@/features/site/components/team";

export const metadata: Metadata = {
  title: "Profissionais",
  description: "Conheça os especialistas da Oralclin em estética do sorriso, implantodontia e ortodontia.",
  alternates: { canonical: "/profissionais" },
};

export default function ProfessionalsPublicPage() {
  return (
    <>
      <PageHero eyebrow="Equipe" title="Especialistas dedicados ao seu sorriso." description="Formação sólida, atualização constante e o compromisso de explicar cada etapa do tratamento." />
      <TeamGrid />
    </>
  );
}
