"use client";

import { ArrowRight, CalendarCheck, ChevronDown, ScanFace, Sparkles } from "lucide-react";
import Link from "next/link";
import { SafeImage } from "@/components/shared/safe-image";
import { WhatsappIcon } from "@/components/shared/social-icons";
import { CountUp } from "@/components/site/reveal";
import { buttonVariants } from "@/components/ui/button";
import { imageFocus } from "@/data/images";
import { whatsappLink } from "@/utils/whatsapp";
import { usePublicTreatments, useSiteContent } from "../hooks";

/** Destaca as duas últimas palavras do título em itálico dourado ("…um novo capítulo."). */
function AccentTitle({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 4) return <>{text}</>;
  const head = words.slice(0, -2).join(" ");
  const tail = words.slice(-2).join(" ");
  return (
    <>
      {head} <em className="text-gold-gradient animate-shimmer pr-1 font-serif italic">{tail}</em>
    </>
  );
}

export function HomeHero() {
  const c = useSiteContent();
  const stats = c.clinicStats.slice(0, 3);
  return (
    <section className="relative isolate overflow-hidden bg-[#161513] text-white" aria-label="Apresentação">
      {/* Imagem: coluna da direita no desktop, fundo no celular */}
      <div className="absolute inset-0 lg:left-[44%]">
        <div className="absolute inset-0 overflow-hidden">
          <SafeImage
            fallback="clinic"
            src={c.heroImage}
            alt="Atendimento na Oralclin"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="animate-ken-burns object-cover"
            style={{ objectPosition: imageFocus(c.heroImage) ?? "50% 40%" }}
          />
        </div>
        <div className="absolute inset-0 lg:hidden" style={{ background: "linear-gradient(0deg, #161513 0%, rgba(22,21,19,0.88) 45%, rgba(22,21,19,0.35) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#161513] to-transparent" />
      </div>
      {/* Degradê sobre toda a seção (desktop) para a foto se fundir ao fundo sem emenda */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{ background: "linear-gradient(90deg, #161513 0%, #161513 45%, rgba(22,21,19,0.9) 50%, rgba(22,21,19,0.5) 62%, rgba(22,21,19,0.1) 78%, rgba(22,21,19,0) 90%)" }}
        aria-hidden
      />

      {/* Brilho champagne */}
      <div className="pointer-events-none absolute -left-40 top-1/3 size-[620px] rounded-full bg-gold/20 blur-[140px]" aria-hidden />
      <svg className="pointer-events-none absolute -left-56 top-10 size-[760px] text-champagne/25" viewBox="0 0 200 200" fill="none" aria-hidden>
        <circle cx="100" cy="100" r="99" stroke="currentColor" strokeWidth="0.25" />
        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.25" />
        <circle cx="100" cy="100" r="61" stroke="currentColor" strokeWidth="0.25" />
      </svg>

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1240px] flex-col px-5 pb-10 pt-[120px] sm:px-8 lg:pt-[150px]">
        <div className="flex flex-1 items-center">
          <div className="max-w-[640px] pt-[32vh] sm:pt-[38vh] lg:pt-0">
            <p className="inline-flex animate-rise items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] py-1.5 pl-1.5 pr-4 text-[12px] font-medium tracking-wide text-white/85 backdrop-blur">
              <span className="flex size-6 items-center justify-center rounded-full bg-gold text-white">
                <Sparkles className="size-3.5" />
              </span>
              {c.heroEyebrow}
            </p>
            <h1 className="mt-7 animate-rise text-balance font-serif text-[46px] leading-[1.02] tracking-[-0.02em] [animation-delay:80ms] sm:text-[66px] lg:text-[82px]">
              <AccentTitle text={c.heroTitle} />
            </h1>
            <p className="mt-7 max-w-[520px] animate-rise text-[17px] leading-relaxed text-white/70 [animation-delay:160ms] sm:text-[18px]">{c.heroSubtitle}</p>
            <div className="mt-10 flex animate-rise flex-col gap-3 [animation-delay:240ms] sm:flex-row">
              <Link
                href="/agendar"
                className={buttonVariants({
                  variant: "gold",
                  size: "xl",
                  className: "group h-14 rounded-full px-8 text-[15.5px] shadow-[0_18px_40px_-14px_rgba(182,154,103,0.9)]",
                })}
              >
                Agendar minha avaliação <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={whatsappLink(c.whatsapp, "Olá! Vim pelo site e gostaria de agendar uma avaliação.")}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({
                  variant: "secondary",
                  size: "xl",
                  className: "h-14 rounded-full border-white/20 bg-white/[0.06] px-7 text-[15.5px] text-white backdrop-blur hover:border-white/40 hover:bg-white/10",
                })}
              >
                <WhatsappIcon className="size-[18px]" /> Falar no WhatsApp
              </a>
            </div>
            <ul className="mt-9 flex animate-rise flex-wrap gap-x-6 gap-y-3 [animation-delay:320ms]">
              {c.heroHighlights.filter(Boolean).map((h) => (
                <li key={h} className="flex items-center gap-2 text-[13.5px] text-white/70">
                  <span className="size-1.5 rounded-full bg-champagne" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cartões flutuantes (desktop) */}
        <div className="pointer-events-none absolute bottom-[19%] right-8 hidden animate-float lg:block xl:right-0">
          <div className="glass flex items-center gap-3 rounded-[18px] p-4 pr-6 text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]">
            <span className="flex size-11 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
              <ScanFace className="size-5" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold leading-tight">Planejamento digital</p>
              <p className="text-[12px] text-muted">Veja o resultado antes de começar</p>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute left-[49%] top-[46%] hidden animate-float [animation-delay:-3.5s] lg:block">
          <div className="glass-dark flex items-center gap-3 rounded-[18px] border border-white/10 p-4 pr-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
            <span className="flex size-11 items-center justify-center rounded-full bg-white/10 text-champagne">
              <CalendarCheck className="size-5" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold leading-tight">Agendamento online</p>
              <p className="text-[12px] text-white/60">Escolha dia e horário em 1 minuto</p>
            </div>
          </div>
        </div>

        {/* Números da clínica */}
        {stats.length ? (
          <div className="mt-14 animate-rise [animation-delay:420ms]">
            <dl className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-7 lg:max-w-[640px]">
              {stats.map((s) => (
                <div key={s.id} className="px-3 first:pl-0 sm:px-6">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <CountUp value={s.value} className="block font-serif text-[30px] leading-none text-white sm:text-[42px]" />
                    <span className="mt-2 block text-[11.5px] leading-snug text-white/50 sm:text-[12.5px]">{s.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <a href="#tratamentos" className="absolute bottom-8 right-8 hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50 transition-colors hover:text-white lg:flex" aria-label="Rolar para os tratamentos">
          Role <ChevronDown className="size-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}

/** Faixa contínua com os tratamentos, logo abaixo do hero. */
export function TreatmentsMarquee() {
  const treatments = usePublicTreatments().filter((t) => t.slug !== "avaliacao");
  if (treatments.length < 3) return null;
  const items = [...treatments, ...treatments];
  return (
    <div className="relative overflow-hidden border-b border-line bg-ivory py-6" aria-hidden>
      <div className="mask-fade-x">
        <ul className="flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused]">
          {items.map((t, i) => (
            <li key={`${t.id}-${i}`} className="flex items-center gap-10 whitespace-nowrap">
              <span className="font-serif text-[26px] italic text-ink/80 sm:text-[30px]">{t.name}</span>
              <svg viewBox="0 0 24 24" className="size-4 text-gold" fill="currentColor">
                <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
              </svg>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
