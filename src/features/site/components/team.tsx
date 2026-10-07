"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { WEEKDAY_SHORT } from "@/features/professionals/types";
import { usePublicProfessionals, usePublicTreatments } from "../hooks";
import { ProfessionalPortrait } from "./professional-portrait";

export function TeamGrid() {
  const professionals = usePublicProfessionals();
  const treatments = usePublicTreatments();
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <ul className={cn("grid gap-x-8 gap-y-16 md:grid-cols-2", professionals.length % 4 === 0 ? "xl:grid-cols-4 xl:gap-x-6" : "lg:grid-cols-3")}>
          {professionals.map((p, i) => (
            <Reveal as="li" key={p.id} delay={i * 110} className="flex flex-col">
              <ProfessionalPortrait professional={p} className="rounded-[26px]" />
              <h2 className="mt-6 font-serif text-[28px] leading-tight">
                {p.title} {p.name}
              </h2>
              <p className="mt-1.5 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-gold-dark">{p.specialty}</p>
              {p.cro ? <p className="mt-1 text-[12px] text-subtle">{p.cro}</p> : null}
              <p className="mt-4 text-[14.5px] leading-relaxed text-muted">{p.bio}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {p.treatmentIds
                  .map((id) => treatments.find((t) => t.id === id))
                  .filter((t) => t && t.slug !== "avaliacao")
                  .map((t) => (
                    <Link key={t!.id} href={`/tratamentos/${t!.slug}`} className="rounded-full border border-line bg-ivory px-3 py-1 text-[12px] text-ink-2 transition-colors hover:border-gold hover:text-gold-dark">
                      {t!.name}
                    </Link>
                  ))}
              </div>
              <p className="mt-auto pt-5 text-[12px] text-subtle">Atende: {p.workingHours.map((h) => WEEKDAY_SHORT[h.weekday]).join(", ")}</p>
              <Link href={`/agendar?profissional=${p.id}`} className={buttonVariants({ size: "lg", className: "group mt-7 self-start rounded-full px-6" })}>
                Agendar com {p.title} {p.name.split(" ")[0]} <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
