"use client";

import { ArrowUpRight, Clock, Layers } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TreatmentVisual } from "@/components/shared/treatment-visual";
import { Reveal } from "@/components/site/reveal";
import { TREATMENT_CATEGORY_LABELS, type TreatmentCategory } from "@/features/treatments/types";
import { cn } from "@/utils/cn";
import { formatMinutes } from "@/utils/format";
import { usePublicTreatments } from "../hooks";

export function TreatmentsCatalog() {
  const treatments = usePublicTreatments();
  const [category, setCategory] = useState<TreatmentCategory | "todos">("todos");
  const categories = [...new Set(treatments.map((t) => t.category))];
  const list = treatments.filter((t) => category === "todos" || t.category === category);

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="scrollbar-thin -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar por categoria">
          {(["todos", ...categories] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-all",
                category === c ? "border-ink bg-ink text-white shadow-[0_8px_20px_-10px_rgba(32,32,32,0.6)]" : "border-line bg-white text-ink-2 hover:border-ink",
              )}
            >
              {c === "todos" ? "Todos" : TREATMENT_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <ul className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t, i) => (
            <Reveal as="li" key={t.id} delay={(i % 3) * 90}>
              <Link href={`/tratamentos/${t.slug}`} className="group block">
                <div className="relative overflow-hidden rounded-[24px]">
                  <TreatmentVisual
                    slug={t.slug}
                    category={t.category}
                    name={t.name}
                    image={t.image}
                    className="aspect-[4/3] transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161513]/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2 backdrop-blur">
                    {TREATMENT_CATEGORY_LABELS[t.category]}
                  </span>
                  <span className="absolute bottom-4 right-4 flex size-11 translate-y-2 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
                <h2 className="mt-5 font-serif text-[26px] leading-tight transition-colors group-hover:text-gold-dark">{t.name}</h2>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{t.shortDescription}</p>
                <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-4 text-[12.5px] text-subtle">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {formatMinutes(t.durationMinutes)} por sessão
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="size-3.5" /> {t.sessions}
                  </span>
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
