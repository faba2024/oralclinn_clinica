"use client";

import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/brand";
import { InstagramIcon, WhatsappIcon } from "@/components/shared/social-icons";
import { usePublicTreatments, useSiteContent } from "@/features/site/hooks";
import { formatPhone } from "@/utils/format";
import { whatsappLink } from "@/utils/whatsapp";

export function SiteFooter() {
  const content = useSiteContent();
  const treatments = usePublicTreatments().filter((t) => t.featured).slice(0, 5);
  const pathname = usePathname();
  // A home e o agendamento já terminam com uma chamada própria.
  const showCta = pathname !== "/" && !pathname.startsWith("/agendar");
  return (
    <footer className="grain relative overflow-hidden bg-[#161513] text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[360px] w-[900px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" aria-hidden />
      <div className="relative mx-auto max-w-[1240px] px-5 pb-10 pt-20 sm:px-8">
        {showCta ? (
        <div className="mb-16 flex flex-col gap-8 border-b border-white/10 pb-16 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-xl text-balance font-serif text-[34px] leading-[1.1] sm:text-[46px]">
            Pronto para o seu <em className="text-gold-gradient">novo sorriso?</em>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/agendar" className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-gold-dark">
              Agendar avaliação <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappLink(content.whatsapp, "Olá! Gostaria de agendar uma avaliação.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <WhatsappIcon className="size-[18px]" /> {formatPhone(content.whatsapp)}
            </a>
          </div>
        </div>
        ) : null}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Logo tone="light" logoUrl={content.logo} />
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-white/55">{content.brandTagline}. Estrutura completa, especialistas e planejamento personalizado para cada sorriso.</p>
            <div className="mt-6 flex gap-2">
              <a href={`https://instagram.com/${content.instagram}`} target="_blank" rel="noreferrer" aria-label="Instagram da Oralclin" className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-champagne hover:text-champagne">
                <InstagramIcon className="size-[18px]" />
              </a>
              <a href={whatsappLink(content.whatsapp, "Olá! Gostaria de agendar uma avaliação.")} target="_blank" rel="noreferrer" aria-label="WhatsApp da Oralclin" className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-champagne hover:text-champagne">
                <WhatsappIcon className="size-[18px]" />
              </a>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">Navegação</p>
            <ul className="mt-4 space-y-2.5 text-[13.5px] text-white/70">
              {[
                ["/tratamentos", "Tratamentos"],
                ["/antes-e-depois", "Antes e Depois"],
                ["/profissionais", "Profissionais"],
                ["/clinica", "A clínica"],
                ["/contato", "Contato"],
                ["/agendar", "Agendar avaliação"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">Tratamentos</p>
            <ul className="mt-4 space-y-2.5 text-[13.5px] text-white/70">
              {treatments.map((t) => (
                <li key={t.id}>
                  <Link href={`/tratamentos/${t.slug}`} className="transition-colors hover:text-white">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne">Contato</p>
            <ul className="mt-4 space-y-3 text-[13.5px] text-white/70">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-champagne" />
                <a href={content.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                  {content.address}
                  {content.city ? ` — ${content.city}` : ""}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-champagne" />
                <a href={`tel:+55${content.phone}`} className="hover:text-white">
                  {formatPhone(content.phone)}
                </a>
              </li>
              {content.email ? (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-champagne" />
                <a href={`mailto:${content.email}`} className="hover:text-white">
                  {content.email}
                </a>
              </li>
              ) : null}
              {content.hours.map((h) => (
                <li key={h.id} className="flex gap-2.5">
                  <Clock className="mt-0.5 size-4 shrink-0 text-champagne" />
                  <span>
                    {h.label}: {h.hours}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {content.brandName}. Todos os direitos reservados.
          </p>
          <p>Responsável técnico conforme registro no CRO. Resultados podem variar conforme cada paciente.</p>
        </div>
      </div>
      <p
        className="pointer-events-none relative -mb-[0.24em] select-none text-center font-serif text-[22vw] leading-[0.8] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgba(214,195,156,0.18)] lg:text-[18vw]"
        aria-hidden
      >
        {content.brandName}
      </p>
    </footer>
  );
}
