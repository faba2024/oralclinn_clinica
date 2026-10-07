import type { Metadata } from "next";
import { PageHero } from "@/components/site/section-heading";
import { BeforeAfterGallery } from "@/features/site/components/gallery";

export const metadata: Metadata = {
  title: "Antes e Depois",
  description: "Casos reais de facetas, lentes de contato dental e reabilitação oral realizados na Oralclin.",
  alternates: { canonical: "/antes-e-depois" },
};

export default function BeforeAfterPage() {
  return (
    <>
      <PageHero eyebrow="Antes e depois" title="Transformações planejadas com cuidado." description="Arraste o controle sobre cada imagem para comparar o antes e o depois." />
      <BeforeAfterGallery />
    </>
  );
}
