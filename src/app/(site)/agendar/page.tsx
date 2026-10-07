import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/site/section-heading";
import { BookingWizard } from "@/features/site/components/booking-wizard";

export const metadata: Metadata = {
  title: "Agendar avaliação",
  description: "Agende sua avaliação na Oralclin em poucos passos: escolha o tratamento, o profissional, a data e o horário.",
  alternates: { canonical: "/agendar" },
};

export default function BookingPage() {
  return (
    <>
      <PageHero eyebrow="Agendamento online" title="Agende sua avaliação." description="Escolha o tratamento, o profissional e o melhor horário. Leva menos de um minuto." />
      <section className="bg-ivory pb-24 pt-10 sm:pt-14">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <Suspense>
            <BookingWizard />
          </Suspense>
        </div>
      </section>
    </>
  );
}
