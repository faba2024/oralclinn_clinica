"use client";

import { ArrowRight, ArrowUpRight, CalendarCheck, ClipboardCheck, MapPin, Plus, Quote, Smile, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SafeImage } from "@/components/shared/safe-image";
import { WhatsappIcon } from "@/components/shared/social-icons";
import { TreatmentVisual } from "@/components/shared/treatment-visual";
import { CountUp, Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { imageFocus } from "@/data/images";
import { BeforeAfterSlider } from "@/features/before-after/components/before-after-slider";
import { RESULT_DISCLAIMER } from "@/features/before-after/service";
import { TREATMENT_CATEGORY_LABELS } from "@/features/treatments/types";
import { cn } from "@/utils/cn";
import { formatPhone } from "@/utils/format";
import { whatsappLink } from "@/utils/whatsapp";
import { usePublicCases, usePublicProfessionals, usePublicTreatments, useSiteContent } from "../hooks";
import { ProfessionalPortrait } from "./professional-portrait";

/* --------------------------------------------------------------------------
   Tratamentos — grade editorial (bento)
   -------------------------------------------------------------------------- */

// Posições na grade de 3 colunas: grande, pequeno / pequeno, grande / pequeno, pequeno, CTA.
const BENTO = ["lg:col-span-2", "", "", "lg:col-span-2", "", ""];

export function TreatmentsShowcase() {
  const treatments = usePublicTreatments();
  const featured = treatments.filter((t) => t.featured).slice(0, 6);
  const list = featured.length >= 3 ? featured : treatments.slice(0, 6);
  const total = treatments.length;
  return (
    <section id="tratamentos" className="scroll-mt-20 bg-white py-24 sm:py-32" aria-labelledby="sec-tratamentos">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Tratamentos"
            title={
              <span id="sec-tratamentos">
                Cuidado completo, do essencial <em className="text-gold-dark">ao estético.</em>
              </span>
            }
            description="Cada tratamento começa com uma avaliação cuidadosa e um plano transparente — etapas, prazos e valores claros desde o início."
            action={
              <Link href="/tratamentos" className={buttonVariants({ variant: "secondary", size: "lg", className: "group rounded-full" })}>
                Todos os tratamentos <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />
        </Reveal>
        <ul className="mt-14 grid auto-rows-[340px] gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[360px]">
          {list.map((t, i) => (
            <Reveal as="li" key={t.id} delay={(i % 3) * 90} className={cn(BENTO[i], i === 0 && "sm:col-span-2")}>
              <Link href={`/tratamentos/${t.slug}`} className="group relative block h-full overflow-hidden rounded-[26px] bg-sand">
                <TreatmentVisual
                  slug={t.slug}
                  category={t.category}
                  name={t.name}
                  image={t.image}
                  sizes={BENTO[i].startsWith("lg:col-span-2") ? "(max-width: 1024px) 100vw, 800px" : "(max-width: 640px) 100vw, 400px"}
                  className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161513]/90 via-[#161513]/25 to-transparent transition-opacity duration-500 group-hover:from-[#161513]/95" />
                <span className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
                  {TREATMENT_CATEGORY_LABELS[t.category]}
                </span>
                <span className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg transition-all duration-500 group-hover:rotate-45 group-hover:opacity-100">
                  <ArrowUpRight className="size-5" />
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                  <p className="text-[12px] font-semibold tabular tracking-[0.2em] text-champagne">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className={cn("mt-2 font-serif leading-[1.05]", BENTO[i].startsWith("lg:col-span-2") ? "text-[34px] sm:text-[40px]" : "text-[28px]")}>{t.name}</h3>
                  <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/70 transition-all duration-500 lg:max-h-0 lg:translate-y-2 lg:opacity-0 lg:group-hover:max-h-24 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                    {t.shortDescription}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
          <Reveal as="li" delay={180}>
            <Link
              href="/tratamentos"
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] bg-ivory p-7 ring-1 ring-line transition-colors hover:ring-champagne"
            >
              <svg className="pointer-events-none absolute -bottom-24 -right-24 size-[320px] text-champagne transition-transform duration-[1.2s] group-hover:rotate-45" viewBox="0 0 200 200" fill="none" aria-hidden>
                <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="0.6" />
                <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.6" />
                <circle cx="100" cy="100" r="42" stroke="currentColor" strokeWidth="0.6" />
              </svg>
              <p className="eyebrow">Catálogo completo</p>
              <div className="relative">
                <p className="font-serif text-[64px] leading-none text-gold-dark">{total}</p>
                <p className="mt-2 max-w-[240px] font-serif text-[24px] leading-snug">tratamentos com especialistas em cada área.</p>
                <span className="mt-6 inline-flex items-center gap-3 text-[14px] font-semibold">
                  Ver todos
                  <span className="flex size-11 items-center justify-center rounded-full bg-ink text-white transition-transform group-hover:translate-x-1">
                    <ArrowRight className="size-4" />
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   Jornada
   -------------------------------------------------------------------------- */

export function Journey() {
  const steps = [
    { icon: <ClipboardCheck />, title: "Avaliação sem pressa", text: "Escuta, exame clínico completo e fotografias. Entendemos o que você deseja para o seu sorriso." },
    { icon: <Smile />, title: "Planejamento digital", text: "Simulação do sorriso e um plano transparente, com etapas, prazos e valores definidos." },
    { icon: <CalendarCheck />, title: "Tratamento acompanhado", text: "Especialistas em cada fase e retornos programados para cuidar do resultado a longo prazo." },
  ];
  return (
    <section className="relative overflow-hidden bg-ivory py-24 sm:py-32" aria-labelledby="sec-jornada">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-champagne/25 blur-[120px]" aria-hidden />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Como funciona"
            title={
              <span id="sec-jornada">
                Uma jornada clara, do primeiro contato <em className="text-gold-dark">ao novo sorriso.</em>
              </span>
            }
          />
        </Reveal>
        <ol className="relative mt-20 grid gap-12 md:grid-cols-3 md:gap-8">
          <span className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-champagne to-transparent md:block" aria-hidden />
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 140} className="relative text-center">
              <div className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-white text-gold-dark shadow-[0_14px_30px_-12px_rgba(154,127,79,0.45)] ring-1 ring-champagne/60 [&_svg]:size-6">
                {s.icon}
                <span className="absolute -right-1.5 -top-1.5 flex size-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">{i + 1}</span>
              </div>
              <h3 className="mt-8 font-serif text-[26px]">{s.title}</h3>
              <p className="mx-auto mt-3 max-w-[300px] text-[15px] leading-relaxed text-muted">{s.text}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-16 flex justify-center">
          <Link href="/agendar" className={buttonVariants({ size: "xl", className: "group rounded-full px-8" })}>
            Começar pela avaliação <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   Antes e depois
   -------------------------------------------------------------------------- */

export function BeforeAfterShowcase() {
  const cases = usePublicCases();
  const [active, setActive] = useState(0);
  if (!cases.length) return null;
  const current = cases[Math.min(active, cases.length - 1)];
  return (
    <section className="grain relative overflow-hidden bg-[#161513] py-24 text-white sm:py-32" aria-labelledby="sec-resultados">
      <div className="pointer-events-none absolute -right-40 top-10 size-[600px] rounded-full bg-gold/15 blur-[140px]" aria-hidden />
      <div className="relative mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <Reveal>
          <p className="eyebrow text-champagne">Antes e depois</p>
          <h2 id="sec-resultados" className="mt-4 text-balance font-serif text-[38px] leading-[1.08] sm:text-[52px]">
            Resultados que respeitam a sua <em className="text-gold-gradient">naturalidade.</em>
          </h2>
          <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-white/60">Arraste o controle sobre a imagem para comparar. Cada caso é planejado de forma individual, a partir do seu rosto.</p>
          <ul className="mt-8 space-y-2">
            {cases.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-[16px] border px-3 py-3 text-left transition-all duration-300",
                    i === active ? "border-champagne/50 bg-white/[0.07]" : "border-white/10 hover:border-white/25 hover:bg-white/[0.03]",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="relative h-12 w-[72px] shrink-0 overflow-hidden rounded-[10px] bg-white/10">
                      <SafeImage fallback="treatment" src={c.afterImage} alt="" fill sizes="72px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium">{c.title}</span>
                      <span className="block text-[12.5px] text-white/50">{c.patientLabel}</span>
                    </span>
                  </span>
                  <span className={cn("flex size-7 items-center justify-center rounded-full transition-colors", i === active ? "bg-champagne text-ink" : "bg-white/10 text-white/50")}>
                    <ArrowRight className="size-3.5" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Link href="/antes-e-depois" className="group mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-champagne hover:text-white">
            Ver galeria completa <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <Reveal variant="scale" delay={120}>
          <div className="relative">
            <div className="absolute -inset-3 rounded-[30px] border border-champagne/20" aria-hidden />
            <BeforeAfterSlider key={current.id} before={current.beforeImage} after={current.afterImage} alt={current.title} aspect="aspect-[16/10]" className="rounded-[24px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)]" />
          </div>
          <p className="mt-5 text-[12px] text-white/40">{RESULT_DISCLAIMER}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   Especialistas
   -------------------------------------------------------------------------- */

export function ProfessionalsShowcase() {
  const professionals = usePublicProfessionals();
  if (!professionals.length) return null;
  return (
    <section className="bg-white py-24 sm:py-32" aria-labelledby="sec-equipe">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Especialistas"
            title={
              <span id="sec-equipe">
                Uma equipe que conversa entre si <em className="text-gold-dark">— e com você.</em>
              </span>
            }
            action={
              <Link href="/profissionais" className={buttonVariants({ variant: "secondary", size: "lg", className: "group rounded-full" })}>
                Conhecer a equipe <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />
        </Reveal>
        <ul className={cn("mt-14 grid gap-6 sm:grid-cols-2", professionals.length % 4 === 0 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
          {professionals.map((p, i) => (
            <Reveal as="li" key={p.id} delay={i * 110}>
              <Link href={`/agendar?profissional=${p.id}`} className="group block">
                <div className="overflow-hidden rounded-[24px]">
                  <ProfessionalPortrait professional={p} className="rounded-[24px] transition-transform duration-700 group-hover:scale-[1.03]" />
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-[24px] leading-tight">
                      {p.title} {p.name}
                    </h3>
                    <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-gold-dark">{p.specialty}</p>
                  </div>
                  <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-line transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-[14.5px] leading-relaxed text-muted">{p.bio}</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   A clínica
   -------------------------------------------------------------------------- */

export function ClinicShowcase() {
  const c = useSiteContent();
  return (
    <section className="relative overflow-hidden bg-sand/70 py-24 sm:py-32" aria-labelledby="sec-clinica">
      <div className="mx-auto grid max-w-[1240px] items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal variant="scale" className="relative mx-auto w-full max-w-[480px]">
          <div className="absolute -inset-4 rounded-t-[999px] rounded-b-[36px] border border-champagne" aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[30px] shadow-[0_40px_80px_-40px_rgba(32,32,32,0.45)]">
            <SafeImage fallback="clinic" src={c.clinicImage} alt="Fachada da Oralclin" fill sizes="(max-width: 1024px) 90vw, 480px" className="object-cover" style={{ objectPosition: imageFocus(c.clinicImage) }} />
          </div>
          {c.clinicStats[0] ? (
            <div className="absolute -bottom-6 -right-2 animate-float rounded-[20px] bg-white p-5 shadow-[var(--shadow-pop)] sm:-right-10">
              <CountUp value={c.clinicStats[0].value} className="block font-serif text-[40px] leading-none text-gold-dark" />
              <p className="mt-1 max-w-[150px] text-[12.5px] text-muted">{c.clinicStats[0].label}</p>
            </div>
          ) : null}
        </Reveal>
        <Reveal delay={120}>
          <p className="eyebrow">A clínica</p>
          <h2 id="sec-clinica" className="mt-4 text-balance font-serif text-[38px] leading-[1.08] sm:text-[50px]">
            {c.clinicTitle}
          </h2>
          <p className="mt-6 text-[16.5px] leading-relaxed text-muted">{c.clinicText}</p>
          <dl className="mt-10 grid grid-cols-3 gap-3">
            {c.clinicStats.map((s) => (
              <div key={s.id} className="rounded-[20px] border border-line-strong/50 bg-white/70 p-4 sm:p-5">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <CountUp value={s.value} className="block font-serif text-[30px] leading-none sm:text-[38px]" />
                  <span className="mt-2 block text-[12px] leading-snug text-muted sm:text-[12.5px]">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/clinica" className={buttonVariants({ size: "lg", className: "group rounded-full px-7" })}>
              Conheça a estrutura <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a href={c.mapsUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary", size: "lg", className: "rounded-full px-7" })}>
              <MapPin /> Como chegar
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   Depoimentos
   -------------------------------------------------------------------------- */

export function Testimonials() {
  const c = useSiteContent();
  const list = c.testimonials.filter((t) => t.published && t.text.trim()).slice(0, 3);
  if (!list.length) return null;
  const average = list.reduce((sum, t) => sum + t.rating, 0) / list.length;
  return (
    <section className="bg-white py-24 sm:py-32" aria-labelledby="sec-depoimentos">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal className="flex flex-col items-center text-center">
          <p className="eyebrow">Depoimentos</p>
          <h2 id="sec-depoimentos" className="mt-4 max-w-2xl text-balance font-serif text-[36px] leading-[1.1] sm:text-[48px]">
            Quem passa por aqui <em className="text-gold-dark">volta sorrindo.</em>
          </h2>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-line bg-ivory px-4 py-2">
            <span className="flex gap-0.5 text-gold" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </span>
            <span className="text-[13.5px] font-semibold tabular">{average.toFixed(1).replace(".", ",")}</span>
            <span className="text-[13px] text-muted">nas avaliações dos pacientes</span>
          </div>
        </Reveal>
        <ul className="mt-16 grid gap-5 md:grid-cols-3">
          {list.map((t, i) => (
            <Reveal
              as="li"
              key={t.id}
              delay={i * 120}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-[26px] border p-8 transition-all duration-500 hover:-translate-y-1",
                i === 1 ? "border-transparent bg-[#161513] text-white shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] md:-translate-y-4 md:hover:-translate-y-5" : "border-line bg-ivory hover:shadow-[var(--shadow-card)]",
              )}
            >
              <Quote className={cn("size-9", i === 1 ? "text-gold" : "text-champagne")} aria-hidden />
              <blockquote className="mt-6 flex-1 font-serif text-[20px] leading-relaxed">“{t.text}”</blockquote>
              <div className={cn("mt-8 flex items-center justify-between border-t pt-5", i === 1 ? "border-white/10" : "border-line")}>
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} size="md" color="#B69A67" />
                  <div>
                    <p className="text-[14px] font-semibold">{t.name}</p>
                    <p className={cn("text-[12.5px]", i === 1 ? "text-white/50" : "text-muted")}>{t.treatment}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 text-gold" aria-label={`${t.rating} de 5 estrelas`}>
                  {Array.from({ length: t.rating }, (_, k) => (
                    <Star key={k} className="size-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   Perguntas frequentes
   -------------------------------------------------------------------------- */

export function Faq() {
  const c = useSiteContent();
  const [open, setOpen] = useState(0);
  const hours = c.hours.map((h) => `${h.label.toLowerCase()}, ${h.hours}`).join("; ");

  const items = [
    {
      q: "Como funciona a primeira consulta?",
      a: `É uma avaliação dedicada a entender o que você deseja. Fazemos exame clínico completo, fotografias e, quando necessário, pedimos exames de imagem. Você sai com orientações claras e um plano de tratamento transparente.`,
    },
    {
      q: "Consigo ver o resultado antes de começar?",
      a: "Sim. Nos tratamentos estéticos fazemos o planejamento digital do sorriso e, quando indicado, um ensaio prévio (mock-up) diretamente na boca — assim você aprova o resultado antes de qualquer etapa definitiva.",
    },
    {
      q: "O resultado fica natural?",
      a: "Esse é o nosso ponto de partida. O planejamento considera as proporções do seu rosto, a linha do sorriso e a sua expressão, para um resultado harmônico e não artificial.",
    },
    {
      q: "Quais são as formas de pagamento?",
      a: "As formas de pagamento e as condições de parcelamento são apresentadas junto com o orçamento, após a avaliação, para que você escolha a opção que cabe no seu planejamento.",
    },
    {
      q: "Como faço para agendar?",
      a: "Pelo agendamento online aqui do site você escolhe tratamento, profissional, dia e horário em poucos passos. Se preferir, fale com a nossa equipe pelo WhatsApp.",
    },
    {
      q: "Onde fica a clínica e qual o horário de atendimento?",
      a: `Estamos em ${c.address}${c.city ? ` — ${c.city}` : ""}. Atendemos ${hours}.`,
    },
  ];

  return (
    <section className="bg-ivory py-24 sm:py-32" aria-labelledby="sec-faq">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow">Dúvidas frequentes</p>
          <h2 id="sec-faq" className="mt-4 text-balance font-serif text-[36px] leading-[1.1] sm:text-[46px]">
            Tudo o que você precisa saber <em className="text-gold-dark">antes de vir.</em>
          </h2>
          <p className="mt-5 max-w-sm text-[15.5px] leading-relaxed text-muted">Não encontrou sua pergunta? Nossa equipe responde rapidinho pelo WhatsApp.</p>
          <a
            href={whatsappLink(c.whatsapp, "Olá! Tenho uma dúvida sobre os tratamentos.")}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "secondary", size: "lg", className: "mt-8 rounded-full px-6" })}
          >
            <WhatsappIcon className="size-[18px] text-[#1f8f4e]" /> Perguntar no WhatsApp
          </a>
        </Reveal>
        <Reveal delay={100}>
          <ul className="divide-y divide-line-strong/60 border-y border-line-strong/60">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className={cn("font-serif text-[20px] leading-snug transition-colors sm:text-[22px]", isOpen ? "text-ink" : "text-ink-2")}>{item.q}</span>
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                        isOpen ? "rotate-45 border-ink bg-ink text-white" : "border-line-strong text-ink",
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                  <div id={`faq-${i}`} className={cn("grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-7 pr-14 text-[15.5px] leading-relaxed text-muted">{item.a}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   Chamada final
   -------------------------------------------------------------------------- */

export function FinalCta() {
  const c = useSiteContent();
  return (
    <section className="bg-ivory pb-24 sm:pb-28">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal variant="scale">
          <div className="relative isolate overflow-hidden rounded-[36px] bg-[#161513] px-6 py-20 text-center text-white sm:px-16 sm:py-28">
            <SafeImage fallback="clinic" src={c.heroImage} alt="" fill sizes="1240px" className="-z-10 object-cover opacity-35" style={{ objectPosition: "50% 30%" }} />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#161513]/70 via-[#161513]/80 to-[#161513]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-[120px]" aria-hidden />
            <p className="eyebrow text-champagne">Agende sua avaliação</p>
            <h2 className="mx-auto mt-5 max-w-3xl text-balance font-serif text-[42px] leading-[1.04] sm:text-[68px]">{c.ctaTitle}</h2>
            <p className="mx-auto mt-6 max-w-lg text-[16.5px] leading-relaxed text-white/65">{c.ctaText}</p>
            <div className="mt-11 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/agendar" className={buttonVariants({ variant: "gold", size: "xl", className: "group h-14 rounded-full px-9 text-[15.5px] shadow-[0_18px_40px_-14px_rgba(182,154,103,0.9)]" })}>
                Agendar online <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={whatsappLink(c.whatsapp, "Olá! Gostaria de agendar uma avaliação.")}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "secondary", size: "xl", className: "h-14 rounded-full border-white/20 bg-white/[0.06] px-8 text-[15.5px] text-white backdrop-blur hover:bg-white/10" })}
              >
                <WhatsappIcon className="size-[18px]" /> {formatPhone(c.whatsapp)}
              </a>
            </div>
            <p className="mt-10 flex items-center justify-center gap-1.5 text-[13px] text-white/50">
              <MapPin className="size-4 text-champagne" /> {c.address}
              {c.city ? ` — ${c.city}` : ""}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
