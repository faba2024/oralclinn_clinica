import type { Metadata } from "next";
import { PageHero } from "@/components/site/section-heading";
import { ContactPage } from "@/features/site/components/contact-page";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Oralclin pelo WhatsApp, telefone ou formulário. Agende sua avaliação.",
  alternates: { canonical: "/contato" },
};

export default function ContactPublicPage() {
  return (
    <>
      <PageHero eyebrow="Contato" title="Vamos conversar sobre o seu sorriso." description="Escolha o canal mais confortável para você." />
      <ContactPage />
    </>
  );
}
