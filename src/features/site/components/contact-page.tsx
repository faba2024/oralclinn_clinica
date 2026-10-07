"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { SafeImage } from "@/components/shared/safe-image";
import { InstagramIcon, WhatsappIcon } from "@/components/shared/social-icons";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { formatPhone, maskPhone, onlyDigits } from "@/utils/format";
import { whatsappLink } from "@/utils/whatsapp";
import { usePublicTreatments, useSiteContent } from "../hooks";
import { publicApi } from "../public-api";

const schema = z.object({
  name: z.string().trim().min(3, "Informe seu nome"),
  phone: z.string().refine((v) => onlyDigits(v).length >= 10, "Informe um WhatsApp válido"),
  email: z.string().trim().email("E-mail inválido").or(z.literal("")),
  treatmentId: z.string(),
  message: z.string().trim().min(5, "Conte um pouco sobre o que você procura").max(800),
  consent: z.literal(true, { errorMap: () => ({ message: "É necessário concordar para enviarmos o retorno" }) }),
});

type FormValues = z.input<typeof schema>;

export function ContactPage() {
  const c = useSiteContent();
  const treatments = usePublicTreatments();
  const [sent, setSent] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", phone: "", email: "", treatmentId: "", message: "", consent: false as unknown as true } });

  const onSubmit = async (v: FormValues) => {
    setSendError(null);
    const t = treatments.find((x) => x.id === v.treatmentId);
    try {
      await publicApi.contact({
        name: v.name.trim(),
        phone: onlyDigits(v.phone),
        email: v.email.trim(),
        interest: t?.name ?? "Contato pelo site",
        treatmentId: t?.id ?? null,
        message: v.message.trim(),
        website: honeypot,
      });
      setSent(v.name.split(" ")[0]);
      reset();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Não foi possível enviar. Tente novamente ou fale conosco pelo WhatsApp.");
    }
  };

  const channels = [
    { icon: <WhatsappIcon className="size-5" />, label: "WhatsApp", value: formatPhone(c.whatsapp), href: whatsappLink(c.whatsapp, "Olá! Vim pelo site da Oralclin.") },
    { icon: <Phone className="size-5" />, label: "Telefone", value: formatPhone(c.phone), href: `tel:+55${c.phone}` },
    { icon: <Mail className="size-5" />, label: "E-mail", value: c.email, href: `mailto:${c.email}` },
    { icon: <InstagramIcon className="size-5" />, label: "Instagram", value: `@${c.instagram}`, href: `https://instagram.com/${c.instagram}` },
  ].filter((ch) => ch.value && ch.value !== "@");

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-[22px] bg-sand">
            <SafeImage fallback="clinic" src={c.clinicImage} alt="Fachada da Oralclin" fill sizes="(max-width: 1024px) 90vw, 480px" className="object-cover object-[50%_35%]" />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[12px] font-medium text-ink backdrop-blur">Venha nos visitar</span>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {channels.map((ch) => (
              <li key={ch.label}>
                <a href={ch.href} target={ch.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-4 rounded-[18px] border border-line p-4 transition-colors hover:border-gold">
                  <span className="flex size-11 items-center justify-center rounded-full bg-ivory text-gold-dark ring-1 ring-line">{ch.icon}</span>
                  <span>
                    <span className="block text-[12px] text-subtle">{ch.label}</span>
                    <span className="block text-[15px] font-medium">{ch.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-3 rounded-[18px] bg-ivory p-5 text-[14px]">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-dark" />
              <a href={c.mapsUrl} target="_blank" rel="noreferrer" className="hover:underline">
                {c.address}
                {c.city ? ` — ${c.city}` : ""}
              </a>
            </p>
            {c.hours.map((h) => (
              <p key={h.id} className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-gold-dark" />
                <span>
                  {h.label}: <span className="text-muted">{h.hours}</span>
                </span>
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-line bg-ivory p-6 sm:p-10">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center" role="status">
              <CheckCircle2 className="size-12 text-success" />
              <h2 className="mt-5 font-serif text-[30px]">Obrigado, {sent}!</h2>
              <p className="mt-2 max-w-sm text-muted">Recebemos sua mensagem. Nossa equipe entrará em contato pelo WhatsApp em breve.</p>
              <Button variant="secondary" className="mt-8 rounded-full" onClick={() => setSent(null)}>
                Enviar outra mensagem
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <h2 className="font-serif text-[30px] leading-tight">Envie uma mensagem</h2>
                <p className="mt-1.5 text-[14px] text-muted">Respondemos em horário comercial.</p>
              </div>
              <Field label="Nome" htmlFor="ct-name" error={errors.name?.message} required className="sm:col-span-2">
                <Input id="ct-name" autoComplete="name" className="h-11 bg-white" aria-invalid={!!errors.name} {...register("name")} />
              </Field>
              <Field label="WhatsApp" htmlFor="ct-phone" error={errors.phone?.message} required>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => <Input id="ct-phone" inputMode="tel" autoComplete="tel" className="h-11 bg-white" aria-invalid={!!errors.phone} value={field.value} onChange={(e) => field.onChange(maskPhone(e.target.value))} placeholder="(77) 99999-9999" />}
                />
              </Field>
              <Field label="E-mail" htmlFor="ct-email" error={errors.email?.message}>
                <Input id="ct-email" type="email" autoComplete="email" className="h-11 bg-white" {...register("email")} />
              </Field>
              <Field label="Interesse" htmlFor="ct-trt" className="sm:col-span-2">
                <Select id="ct-trt" className="h-11 bg-white" {...register("treatmentId")}>
                  <option value="">Ainda não sei</option>
                  {treatments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Mensagem" htmlFor="ct-msg" error={errors.message?.message} required className="sm:col-span-2">
                <Textarea id="ct-msg" rows={4} className="bg-white" aria-invalid={!!errors.message} {...register("message")} />
              </Field>
              <div className="sm:col-span-2">
                <label className="flex items-start gap-2.5 text-[13px] text-muted">
                  <input type="checkbox" className="mt-0.5 size-4 accent-[#202020]" {...register("consent")} />
                  Concordo em ser contatado(a) pela Oralclin e com o uso dos meus dados para retorno deste atendimento.
                </label>
                {errors.consent ? <p className="mt-1 text-xs text-danger">{errors.consent.message}</p> : null}
              </div>
              <div className="absolute -left-[9999px] size-px overflow-hidden" aria-hidden="true">
                <label htmlFor="ct-website">Não preencha este campo</label>
                <input id="ct-website" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </div>
              {sendError ? (
                <p role="alert" className="rounded-[10px] bg-danger-soft px-3 py-2.5 text-[13px] text-danger sm:col-span-2">
                  {sendError}
                </p>
              ) : null}
              <Button type="submit" size="xl" loading={isSubmitting} className="rounded-full sm:col-span-2">
                Enviar mensagem
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
