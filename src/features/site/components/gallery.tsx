"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/features/before-after/components/before-after-slider";
import { RESULT_DISCLAIMER } from "@/features/before-after/service";
import { cn } from "@/utils/cn";
import { usePublicCases, usePublicProfessionals, usePublicTreatments } from "../hooks";

export function BeforeAfterGallery() {
  const cases = usePublicCases();
  const treatments = usePublicTreatments();
  const professionals = usePublicProfessionals();
  const [filter, setFilter] = useState<string>("todos");
  const used = treatments.filter((t) => cases.some((c) => c.treatmentId === t.id));
  const list = cases.filter((c) => filter === "todos" || c.treatmentId === filter);

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        {used.length > 1 ? (
          <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filtrar por tratamento">
            {[{ id: "todos", name: "Todos" }, ...used].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                aria-pressed={filter === t.id}
                className={cn("rounded-full border px-4 py-2 text-[13px] font-medium transition-colors", filter === t.id ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}
              >
                {t.name}
              </button>
            ))}
          </div>
        ) : null}

        {list.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-[28px]">Galeria em atualização</p>
            <p className="mt-2 text-muted">Novos casos são publicados com autorização dos pacientes.</p>
          </div>
        ) : (
          <ul className="grid gap-x-8 gap-y-16 lg:grid-cols-2">
            {list.map((c) => {
              const t = treatments.find((x) => x.id === c.treatmentId);
              const p = professionals.find((x) => x.id === c.professionalId);
              return (
                <li key={c.id}>
                  <BeforeAfterSlider before={c.beforeImage} after={c.afterImage} alt={c.title} aspect="aspect-[16/9]" className="rounded-[24px]" />
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark">{t?.name}</p>
                      <h2 className="mt-1.5 font-serif text-[26px] leading-tight">{c.title}</h2>
                      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">{c.description}</p>
                    </div>
                    <div className="shrink-0 text-[12.5px] text-subtle sm:text-right">
                      <p>{c.patientLabel}</p>
                      {p ? <p>{p.title} {p.name}</p> : null}
                    </div>
                  </div>
                  {t ? (
                    <Link href={`/tratamentos/${t.slug}`} className="mt-4 inline-block text-[13px] font-medium underline decoration-champagne underline-offset-4 hover:decoration-gold">
                      Conhecer {t.name.toLowerCase()}
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-20 flex flex-col items-center gap-6 rounded-[24px] border border-line bg-ivory px-6 py-10 text-center">
          <p className="max-w-xl text-[14px] leading-relaxed text-muted">
            <strong className="font-semibold text-ink">{RESULT_DISCLAIMER}</strong> Imagens publicadas com autorização expressa dos pacientes.
          </p>
          <Link href="/agendar" className={buttonVariants({ size: "lg", className: "rounded-full px-7" })}>
            Agendar minha avaliação
          </Link>
        </div>
      </div>
    </section>
  );
}
