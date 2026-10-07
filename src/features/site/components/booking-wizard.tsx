"use client";

import { addDays, format, getDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, ArrowRight, CalendarPlus, Check, CheckCircle2, Clock, Download, Loader2, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { WhatsappIcon } from "@/components/shared/social-icons";
import { TreatmentVisual } from "@/components/shared/treatment-visual";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, Input, Textarea } from "@/components/ui/input";
import type { Appointment } from "@/features/appointments/types";
import { cn } from "@/utils/cn";
import { combineDateTime, googleCalendarLink, todayISO } from "@/utils/dates";
import { firstName, formatCurrency, formatMinutes, maskPhone, onlyDigits } from "@/utils/format";
import { whatsappLink } from "@/utils/whatsapp";
import { useBookingSettings, usePublicProfessionals, usePublicTreatments, useSiteContent } from "../hooks";
import { PublicApiError, publicApi } from "../public-api";
import { ProfessionalPortrait } from "./professional-portrait";

const STEPS = ["Tratamento", "Profissional", "Data", "Horário", "Seus dados", "Confirmação"];

interface Contact {
  name: string;
  phone: string;
  email: string;
  notes: string;
  consent: boolean;
}

function icsFile(a: Appointment, title: string, location: string) {
  const start = combineDateTime(a.date, a.start);
  const end = new Date(start.getTime() + a.duration * 60000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Oralclin//Agendamento//PT",
    "BEGIN:VEVENT",
    `UID:${a.id}@oralclin`,
    `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(start)}`,
    `DTEND:${f(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
}

export function BookingWizard() {
  const params = useSearchParams();
  const treatments = usePublicTreatments();
  const professionals = usePublicProfessionals();
  const content = useSiteContent();
  const booking = useBookingSettings();
  const [step, setStep] = useState(0);
  const [treatmentId, setTreatmentId] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsError, setSlotsError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [contact, setContact] = useState<Contact>({ name: "", phone: "", email: "", notes: "", consent: false });
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [booked, setBooked] = useState<Appointment | null>(null);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    const t = params.get("tratamento");
    const p = params.get("profissional");
    if (t && treatments.some((x) => x.id === t)) {
      setTreatmentId(t);
      setStep(1);
    }
    if (p) setProfessionalId(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const treatment = treatments.find((t) => t.id === treatmentId) ?? null;
  const professional = professionals.find((p) => p.id === professionalId) ?? null;
  const evaluation = treatments.find((t) => t.slug === "avaliacao" && t.professionalIds.length > 0) ?? null;
  const eligible = useMemo(() => (treatment ? professionals.filter((p) => treatment.professionalIds.includes(p.id)) : professionals), [treatment, professionals]);

  useEffect(() => {
    if (!professionalId || !date || !treatment) return;
    let active = true;
    setSlots(null);
    setSlotsError(false);
    publicApi
      .slots(professionalId, date, treatment.id)
      .then((s) => active && setSlots(s))
      .catch(() => {
        if (!active) return;
        setSlots([]);
        setSlotsError(true);
      });
    return () => {
      active = false;
    };
  }, [professionalId, date, treatment, retry]);

  const maxDate = format(addDays(new Date(), 60), "yyyy-MM-dd");
  const isDayDisabled = (iso: string) => {
    if (iso > maxDate) return true;
    const wd = getDay(parseISO(iso));
    if (!booking.workingDays.includes(wd)) return true;
    return !!professional && !professional.workingHours.some((h) => h.weekday === wd);
  };

  const validateContact = () => {
    const e: Partial<Record<keyof Contact, string>> = {};
    if (contact.name.trim().split(/\s+/).length < 2) e.name = "Informe nome e sobrenome";
    if (onlyDigits(contact.phone).length < 10) e.phone = "Informe um WhatsApp válido com DDD";
    if (contact.email && !/^\S+@\S+\.\S+$/.test(contact.email)) e.email = "E-mail inválido";
    if (!contact.consent) e.consent = "Necessário para confirmarmos seu horário";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canAdvance = [!!treatment, !!professional, !!date, !!time, true, true][step];

  const next = () => {
    if (step === 4 && !validateContact()) return;
    setStep((s) => Math.min(5, s + 1));
  };

  const confirm = async () => {
    if (!treatment || !professional || !date || !time) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const a = await publicApi.book({
        treatmentId: treatment.id,
        professionalId: professional.id,
        date,
        start: time,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        notes: contact.notes,
        website: honeypot,
      });
      setBooked(a);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      if (e instanceof PublicApiError && e.status === 409) {
        setSubmitError("Este horário acabou de ser reservado. Escolha outro horário, por favor.");
        setTime(null);
        setStep(3);
      } else if (e instanceof PublicApiError && e.status === 400) setSubmitError(e.message);
      else setSubmitError("Não foi possível concluir o agendamento. Tente novamente ou fale conosco pelo WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking.allowOnlineBooking) {
    return (
      <div className="mx-auto max-w-xl rounded-[28px] border border-line bg-white p-10 text-center">
        <h2 className="font-serif text-[30px]">Agende pelo WhatsApp</h2>
        <p className="mt-3 text-muted">No momento, os agendamentos estão sendo feitos diretamente com a nossa equipe.</p>
        <a href={whatsappLink(content.whatsapp, "Olá! Gostaria de agendar uma avaliação.")} target="_blank" rel="noreferrer" className={buttonVariants({ size: "xl", className: "mt-8 rounded-full" })}>
          <WhatsappIcon className="size-5" /> Falar no WhatsApp
        </a>
      </div>
    );
  }

  if (booked && treatment && professional) {
    const title = `${treatment.name} — Oralclin`;
    const location = `${content.address}${content.city ? `, ${content.city}` : ""}`;
    const start = combineDateTime(booked.date, booked.start);
    return (
      <div className="mx-auto max-w-2xl animate-scale-in rounded-[32px] border border-line bg-white p-8 text-center shadow-[var(--shadow-card)] sm:p-14" role="status">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-8" />
        </span>
        <p className="eyebrow mt-8">Agendamento recebido</p>
        <h2 className="mt-3 font-serif text-[36px] leading-tight sm:text-[44px]">Até breve, {firstName(contact.name)}!</h2>
        <p className="mx-auto mt-4 max-w-md text-muted">Seu horário foi reservado. Nossa equipe enviará a confirmação pelo WhatsApp.</p>
        <dl className="mx-auto mt-8 grid max-w-md gap-3 rounded-[20px] bg-ivory p-5 text-left text-[14px]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Tratamento</dt>
            <dd className="text-right font-medium">{treatment.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Profissional</dt>
            <dd className="text-right font-medium">
              {professional.title} {professional.name}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Data</dt>
            <dd className="text-right font-medium"><span className="cap-first">{format(start, "EEEE, d 'de' MMMM", { locale: ptBR })}</span></dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Horário</dt>
            <dd className="text-right font-medium">{booked.start}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={googleCalendarLink({ title, start, durationMinutes: booked.duration, location })} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary", size: "lg", className: "rounded-full" })}>
            <CalendarPlus /> Adicionar à agenda
          </a>
          <a href={icsFile(booked, title, location)} download="consulta-oralclin.ics" className={buttonVariants({ variant: "ghost", size: "lg", className: "rounded-full" })}>
            <Download /> Arquivo .ics
          </a>
          <a
            href={whatsappLink(content.whatsapp, `Olá! Acabei de agendar ${treatment.name} com ${professional.title} ${professional.name} para ${format(start, "dd/MM")} às ${booked.start}. Meu nome é ${contact.name}.`)}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ size: "lg", className: "rounded-full bg-[#1f8f4e] hover:bg-[#187a42]" })}
          >
            <WhatsappIcon className="size-4" /> Abrir WhatsApp
          </a>
        </div>
        <Link href="/" className="mt-8 inline-block text-[13px] text-muted hover:text-ink">
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="rounded-[28px] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <ol className="mb-8 flex items-center gap-1.5" aria-label="Etapas do agendamento">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 flex-col gap-2">
              <span className={cn("h-1 rounded-full transition-colors duration-300", i <= step ? "bg-ink" : "bg-sand-2")} />
              <span className={cn("hidden text-[11px] font-medium sm:block", i === step ? "text-ink" : "text-subtle")} aria-current={i === step ? "step" : undefined}>
                {i + 1}. {s}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-[12px] font-medium text-subtle sm:hidden">
          Etapa {step + 1} de {STEPS.length} · {STEPS[step]}
        </p>

        <div key={step} className="animate-fade-in">
          {step === 0 ? (
            <fieldset>
              <legend className="font-serif text-[28px]">Qual tratamento você procura?</legend>
              <p className="mt-1 text-[14px] text-muted">Na dúvida, escolha a avaliação inicial.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {treatments.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTreatmentId(t.id);
                      if (professionalId && !t.professionalIds.includes(professionalId)) setProfessionalId(null);
                      setTime(null);
                      setStep(1);
                    }}
                    aria-pressed={treatmentId === t.id}
                    className={cn(
                      "flex items-center gap-3 rounded-[16px] border p-3 text-left transition-colors",
                      treatmentId === t.id ? "border-ink bg-ivory" : "border-line hover:border-line-strong",
                    )}
                  >
                    <TreatmentVisual slug={t.slug} category={t.category} name={t.name} image={t.image} className="size-14 shrink-0 rounded-[12px]" sizes="56px" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-semibold">{t.name}</span>
                      <span className="block text-[12px] text-subtle">
                        {formatMinutes(t.durationMinutes)} · {t.priceFrom ? `a partir de ${formatCurrency(t.priceFrom).replace(",00", "")}` : "valor sob consulta"}
                      </span>
                    </span>
                    {treatmentId === t.id ? <Check className="size-4 text-gold-dark" /> : null}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {step === 1 ? (
            <fieldset>
              <legend className="font-serif text-[28px]">Com quem você gostaria de ser atendido(a)?</legend>
              {eligible.length === 0 ? (
                <div className="mt-6 rounded-[18px] border border-line bg-ivory p-6">
                  <p className="text-[15px] font-semibold">Este tratamento é agendado diretamente com a nossa equipe.</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                    Fale conosco pelo WhatsApp ou comece por uma avaliação inicial — indicamos o melhor caminho para o seu caso.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <a
                      href={whatsappLink(content.whatsapp, `Olá! Gostaria de agendar ${treatment?.name ?? "um tratamento"}.`)}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({ variant: "gold", className: "rounded-full px-5" })}
                    >
                      Agendar pelo WhatsApp
                    </a>
                    {evaluation ? (
                      <button type="button" onClick={() => setTreatmentId(evaluation.id)} className={buttonVariants({ variant: "secondary", className: "rounded-full px-5" })}>
                        Agendar avaliação inicial
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {eligible.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProfessionalId(p.id);
                      setDate(null);
                      setTime(null);
                      setStep(2);
                    }}
                    aria-pressed={professionalId === p.id}
                    className={cn("flex items-center gap-4 rounded-[16px] border p-3 text-left transition-colors", professionalId === p.id ? "border-ink bg-ivory" : "border-line hover:border-line-strong")}
                  >
                    <ProfessionalPortrait professional={p} className="w-16 shrink-0 rounded-[12px]" showCro={false} sizes="64px" />
                    <span>
                      <span className="block text-[15px] font-semibold">
                        {p.title} {p.name}
                      </span>
                      <span className="block text-[12.5px] text-gold-dark">{p.specialty}</span>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="font-serif text-[28px]">Escolha o melhor dia</h2>
              <p className="mt-1 text-[14px] text-muted">Dias em cinza não têm atendimento com {professional ? `${professional.title} ${professional.name}` : "o profissional"}.</p>
              <div className="mt-6 max-w-sm">
                <Calendar
                  value={date}
                  minDate={todayISO()}
                  isDisabled={isDayDisabled}
                  onChange={(d) => {
                    setDate(d);
                    setTime(null);
                    setStep(3);
                  }}
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h2 className="font-serif text-[28px]">Horários disponíveis</h2>
              <p className="mt-1 text-[14px] cap-first text-muted">{date ? format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR }) : ""}</p>
              {submitError ? <p className="mt-4 rounded-[12px] bg-warning-soft px-4 py-3 text-[13px] text-[#7a5520]">{submitError}</p> : null}
              {slots === null ? (
                <p className="mt-8 flex items-center gap-2 text-[14px] text-muted">
                  <Loader2 className="size-4 animate-spin" /> Buscando horários…
                </p>
              ) : slotsError ? (
                <div className="mt-8 rounded-[16px] bg-ivory p-6 text-center">
                  <p className="font-medium">Não conseguimos carregar os horários agora.</p>
                  <p className="mt-1 text-[13.5px] text-muted">Tente novamente em instantes ou agende pelo WhatsApp.</p>
                  <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                    <Button variant="secondary" className="rounded-full" onClick={() => setRetry((n) => n + 1)}>
                      Tentar novamente
                    </Button>
                    <a href={whatsappLink(content.whatsapp, "Olá! Gostaria de ajuda para agendar.")} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "gold", className: "rounded-full" })}>
                      Agendar pelo WhatsApp
                    </a>
                  </div>
                </div>
              ) : slots.length === 0 ? (
                <div className="mt-8 rounded-[16px] bg-ivory p-6 text-center">
                  <p className="font-medium">Sem horários livres neste dia.</p>
                  <Button variant="secondary" className="mt-4 rounded-full" onClick={() => setStep(2)}>
                    Escolher outra data
                  </Button>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {[
                    { label: "Manhã", items: slots.filter((s) => s < "12:00") },
                    { label: "Tarde", items: slots.filter((s) => s >= "12:00") },
                  ]
                    .filter((g) => g.items.length)
                    .map((g) => (
                      <div key={g.label}>
                        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-subtle">{g.label}</p>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {g.items.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                setTime(s);
                                setSubmitError(null);
                                setStep(4);
                              }}
                              aria-pressed={time === s}
                              className={cn("h-11 rounded-[12px] border text-[14px] font-medium tabular transition-colors", time === s ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : null}

          {step === 4 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
              noValidate
            >
              <h2 className="font-serif text-[28px]">Seus dados</h2>
              <p className="mt-1 text-[14px] text-muted">Usaremos o WhatsApp para confirmar o horário.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Nome completo" htmlFor="bk-name" error={errors.name} required className="sm:col-span-2">
                  <Input id="bk-name" autoComplete="name" className="h-11" value={contact.name} aria-invalid={!!errors.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                </Field>
                <Field label="WhatsApp" htmlFor="bk-phone" error={errors.phone} required>
                  <Input id="bk-phone" inputMode="tel" autoComplete="tel" className="h-11" placeholder="(77) 99999-9999" value={contact.phone} aria-invalid={!!errors.phone} onChange={(e) => setContact({ ...contact, phone: maskPhone(e.target.value) })} />
                </Field>
                <Field label="E-mail" htmlFor="bk-email" error={errors.email}>
                  <Input id="bk-email" type="email" autoComplete="email" className="h-11" value={contact.email} aria-invalid={!!errors.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                </Field>
                <Field label="Observação" htmlFor="bk-notes" hint="Opcional — conte o que gostaria de melhorar." className="sm:col-span-2">
                  <Textarea id="bk-notes" rows={3} value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} />
                </Field>
                <div className="absolute -left-[9999px] size-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="bk-website">Não preencha este campo</label>
                  <input id="bk-website" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-start gap-2.5 text-[13px] text-muted">
                    <input type="checkbox" className="mt-0.5 size-4 accent-[#202020]" checked={contact.consent} onChange={(e) => setContact({ ...contact, consent: e.target.checked })} />
                    Autorizo a Oralclin a entrar em contato pelo WhatsApp sobre este agendamento.
                  </label>
                  {errors.consent ? <p className="mt-1 text-xs text-danger">{errors.consent}</p> : null}
                </div>
              </div>
              <button type="submit" className="sr-only">
                Continuar
              </button>
            </form>
          ) : null}

          {step === 5 && treatment && professional && date && time ? (
            <div>
              <h2 className="font-serif text-[28px]">Confira e confirme</h2>
              <dl className="mt-6 divide-y divide-line rounded-[18px] border border-line text-[14px]">
                {[
                  ["Tratamento", treatment.name, 0],
                  ["Profissional", `${professional.title} ${professional.name}`, 1],
                  ["Data", format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR }), 2],
                  ["Horário", `${time} · ${formatMinutes(treatment.durationMinutes)}`, 3],
                  ["Paciente", `${contact.name} · ${contact.phone}`, 4],
                ].map(([label, value, target]) => (
                  <div key={String(label)} className="flex items-center justify-between gap-4 px-4 py-3.5">
                    <dt className="text-muted">{label}</dt>
                    <dd className="flex items-center gap-3 text-right font-medium">
                      <span className={label === "Data" ? "cap-first" : undefined}>{value}</span>
                      <button type="button" onClick={() => setStep(Number(target))} className="text-[12px] font-normal text-gold-dark hover:underline">
                        Alterar
                      </button>
                    </dd>
                  </div>
                ))}
              </dl>
              {submitError ? <p className="mt-4 rounded-[12px] bg-danger-soft px-4 py-3 text-[13px] text-danger">{submitError}</p> : null}
              <Button size="xl" className="mt-6 w-full rounded-full" onClick={confirm} loading={submitting}>
                Confirmar agendamento
              </Button>
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-full">
            <ArrowLeft /> Voltar
          </Button>
          {step < 5 ? (
            <Button onClick={next} disabled={!canAdvance} className="rounded-full px-6">
              Continuar <ArrowRight />
            </Button>
          ) : null}
        </div>
      </div>

      <aside className="h-fit rounded-[28px] bg-ink p-6 text-white lg:sticky lg:top-28">
        <p className="eyebrow text-champagne">Resumo</p>
        <ul className="mt-5 space-y-4 text-[14px]">
          <li className="flex gap-3">
            <Stethoscope className="mt-0.5 size-4 text-champagne" />
            <span>
              <span className="block text-white/50">Tratamento</span>
              {treatment?.name ?? "—"}
            </span>
          </li>
          <li className="flex gap-3">
            <Check className="mt-0.5 size-4 text-champagne" />
            <span>
              <span className="block text-white/50">Profissional</span>
              {professional ? `${professional.title} ${professional.name}` : "—"}
            </span>
          </li>
          <li className="flex gap-3">
            <Clock className="mt-0.5 size-4 text-champagne" />
            <span>
              <span className="block text-white/50">Data e horário</span>
              <span className="cap-first">{date ? format(parseISO(date), "EEE, dd/MM", { locale: ptBR }) : "—"}</span>
              {time ? ` às ${time}` : ""}
            </span>
          </li>
        </ul>
        <div className="mt-6 border-t border-white/10 pt-5 text-[12.5px] leading-relaxed text-white/50">
          Prefere falar com a gente?{" "}
          <a href={whatsappLink(content.whatsapp, "Olá! Gostaria de ajuda para agendar.")} target="_blank" rel="noreferrer" className="font-medium text-champagne hover:underline">
            Chame no WhatsApp
          </a>
          .
        </div>
      </aside>
    </div>
  );
}
