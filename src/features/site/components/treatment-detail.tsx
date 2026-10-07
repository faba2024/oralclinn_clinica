"use client";

import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock, Layers } from "lucide-react";
import Link from "next/link";
import { TreatmentVisual } from "@/components/shared/treatment-visual";
import { buttonVariants } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/features/before-after/components/before-after-slider";
import { RESULT_DISCLAIMER } from "@/features/before-after/service";
import { TREATMENT_CATEGORY_LABELS, type Treatment } from "@/features/treatments/types";
import { formatCurrency, formatMinutes } from "@/utils/format";
import { whatsappLink } from "@/utils/whatsapp";
import { usePublicCases, usePublicProfessionals, usePublicTreatments, useSiteContent } from "../hooks";
import { ProfessionalPortrait } from "./professional-portrait";

export function TreatmentDetail({ treatment }: { treatment: Treatment }) {
  const publicList = usePublicTreatments();
  const professionals = usePublicProfessionals();
  const cases = usePublicCases();
  const content = useSiteContent();

  const team = professionals.filter((p) => treatment.professionalIds.includes(p.id));
  const relatedCases = cases.filter((c) => c.treatmentId === treatment.id);
  const related = publicList.filter((t) => t.id !== treatment.id && t.category === treatment.category).concat(publicList.filter((t) => t.id !== treatment.id && t.category !== treatment.category && t.featured)).slice(0, 3);

  return (
    <article>
      <section className="bg-ivory pb-16 pt-32 sm:pb-24 sm:pt-40">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Link href="/tratamentos" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
              <ArrowLeft className="size-4" /> Tratamentos
            </Link>
            <p className="eyebrow mt-8">{TREATMENT_CATEGORY_LABELS[treatment.category]}</p>
            <h1 className="mt-4 text-balance font-serif text-[44px] leading-[1.05] tracking-[-0.015em] sm:text-[64px]">{treatment.name}</h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">{treatment.shortDescription}</p>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 [&>div]:min-w-0 [&_dd]:[overflow-wrap:anywhere] [&_dd]:hyphens-auto border-t border-line pt-6">
              <div>
                <dt className="flex items-center gap-1.5 text-[12px] text-subtle"><Clock className="size-3.5" /> Sessão</dt>
                <dd className="mt-1 text-[15px] font-semibold">{formatMinutes(treatment.durationMinutes)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[12px] text-subtle"><Layers className="size-3.5" /> Etapas</dt>
                <dd className="mt-1 text-[15px] font-semibold">{treatment.sessions}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[12px] text-subtle"><CalendarDays className="size-3.5" /> Investimento</dt>
                <dd className="mt-1 text-[15px] font-semibold">{treatment.priceFrom ? `a partir de ${formatCurrency(treatment.priceFrom).replace(",00", "")}` : "Sob consulta"}</dd>
              </div>
            </dl>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href={`/agendar?tratamento=${treatment.id}`} className={buttonVariants({ size: "xl", className: "rounded-full px-7" })}>
                Agendar avaliação <ArrowRight />
              </Link>
              <a
                href={whatsappLink(content.whatsapp, `Olá! Gostaria de saber mais sobre ${treatment.name}.`)}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "secondary", size: "xl", className: "rounded-full px-7" })}
              >
                Tirar dúvidas no WhatsApp
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-[28px]">
            <TreatmentVisual slug={treatment.slug} category={treatment.category} name={treatment.name} image={treatment.image} className="aspect-[4/5]" priority sizes="(max-width: 1024px) 90vw, 560px" />
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-14 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow">Sobre o tratamento</p>
            <p className="mt-6 font-serif text-[24px] leading-[1.45] text-ink sm:text-[28px]">{treatment.description}</p>
          </div>
          <div className="rounded-[24px] border border-line bg-ivory p-8">
            <p className="text-[13px] font-semibold">O que está incluído</p>
            <ul className="mt-5 space-y-4">
              {treatment.benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[15px]">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-gold-dark ring-1 ring-champagne">
                    <Check className="size-3.5" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-line pt-5 text-[12.5px] leading-relaxed text-muted">
              Os valores e a quantidade de sessões são definidos após a avaliação clínica, de acordo com as necessidades de cada paciente.
            </p>
          </div>
        </div>
      </section>

      {relatedCases.length ? (
        <section className="bg-ink py-20 text-white sm:py-28">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <p className="eyebrow text-champagne">Resultados</p>
            <h2 className="mt-4 font-serif text-[36px] sm:text-[44px]">Antes e depois</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {relatedCases.map((c) => (
                <figure key={c.id}>
                  <BeforeAfterSlider before={c.beforeImage} after={c.afterImage} alt={c.title} aspect="aspect-[16/9]" className="rounded-[20px]" />
                  <figcaption className="mt-3 text-[13px] text-white/60">{c.title}</figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-6 text-[12px] text-white/45">{RESULT_DISCLAIMER}</p>
          </div>
        </section>
      ) : null}

      {team.length ? (
        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <p className="eyebrow">Quem realiza</p>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((p) => (
                <li key={p.id} className="flex items-center gap-5">
                  <ProfessionalPortrait professional={p} className="w-28 shrink-0 rounded-[16px]" showCro={false} sizes="112px" />
                  <div>
                    <p className="font-serif text-[21px]">
                      {p.title} {p.name}
                    </p>
                    <p className="text-[13px] text-gold-dark">{p.specialty}</p>
                    <p className="mt-1 text-[12px] text-subtle">{p.cro}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="border-t border-line bg-ivory py-20">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <p className="eyebrow">Veja também</p>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {related.map((t) => (
                <li key={t.id}>
                  <Link href={`/tratamentos/${t.slug}`} className="group flex items-center gap-4 rounded-[18px] border border-line bg-white p-3 transition-shadow hover:shadow-[var(--shadow-soft)]">
                    <TreatmentVisual slug={t.slug} category={t.category} name={t.name} image={t.image} className="size-20 shrink-0 rounded-[12px]" sizes="80px" />
                    <div className="min-w-0">
                      <p className="font-serif text-[18px]">{t.name}</p>
                      <p className="line-clamp-2 text-[12.5px] text-muted">{t.shortDescription}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </article>
  );
}
