"use client";

import { ArrowUpRight, Eye, Images, Plus, RotateCcw, Save, Sparkles, Star, Stethoscope, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ImageUpload } from "@/components/shared/image-upload";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/checkbox";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { seedSiteContent } from "@/data/seed";
import { toast } from "@/stores/toast-store";
import { createId } from "@/utils/id";
import { maskPhone, onlyDigits } from "@/utils/format";
import { useSiteContentQuery } from "../hooks";
import { contentService } from "../service";
import type { SiteContent } from "../types";

type Section = "identidade" | "hero" | "clinica" | "depoimentos" | "contato" | "seo" | "catalogo";

export function ContentView() {
  const { data } = useSiteContentQuery();
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [section, setSection] = useState<Section>("hero");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && !draft) setDraft(data);
  }, [data, draft]);

  if (!draft || !data) return <Skeleton className="h-[600px]" />;

  const dirty = JSON.stringify(draft) !== JSON.stringify(data);
  const set = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  const save = async () => {
    setSaving(true);
    try {
      await contentService.save(draft);
      toast.success("Site atualizado", "As alterações já estão visíveis no site.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "hero" as const, label: "Página inicial" },
    { id: "identidade" as const, label: "Identidade" },
    { id: "clinica" as const, label: "A clínica" },
    { id: "depoimentos" as const, label: "Depoimentos", count: draft.testimonials.length },
    { id: "contato" as const, label: "Contato e horários" },
    { id: "seo" as const, label: "SEO" },
    { id: "catalogo" as const, label: "Catálogo" },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Conteúdo do site"
        description="Edite textos, imagens e informações do site institucional. As mudanças são publicadas ao salvar."
        actions={
          <>
            <Link href="/" target="_blank" className={buttonVariants({ variant: "secondary" })}>
              <Eye /> Ver site
            </Link>
            <Button variant="ghost" onClick={() => setDraft(data)} disabled={!dirty}>
              <RotateCcw /> Descartar
            </Button>
            <Button onClick={save} loading={saving} disabled={!dirty}>
              <Save /> Publicar alterações
            </Button>
          </>
        }
      />

      <Tabs items={tabs} value={section} onChange={setSection} label="Seções do site" className="mb-5" />

      {section === "hero" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <Card>
            <CardBody className="grid gap-4">
              <Field label="Chamada superior" htmlFor="c-eyebrow">
                <Input id="c-eyebrow" value={draft.heroEyebrow} onChange={(e) => set("heroEyebrow", e.target.value)} />
              </Field>
              <Field label="Título principal" htmlFor="c-title" hint="Frase curta e marcante.">
                <Input id="c-title" value={draft.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
              </Field>
              <Field label="Subtítulo" htmlFor="c-sub">
                <Textarea id="c-sub" rows={3} value={draft.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} />
              </Field>
              <Field label="Destaques (um por linha)" htmlFor="c-high">
                <Textarea id="c-high" rows={3} value={draft.heroHighlights.join("\n")} onChange={(e) => set("heroHighlights", e.target.value.split("\n").filter((l, i, arr) => l.trim() || i === arr.length - 1))} />
              </Field>
              <Field label="Chamada final — título" htmlFor="c-cta">
                <Input id="c-cta" value={draft.ctaTitle} onChange={(e) => set("ctaTitle", e.target.value)} />
              </Field>
              <Field label="Chamada final — texto" htmlFor="c-ctatext">
                <Textarea id="c-ctatext" rows={2} value={draft.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
              </Field>
            </CardBody>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader title="Imagem principal" description="Formato vertical. Fotografia da clínica ou da equipe." />
              <CardBody>
                <ImageUpload value={draft.heroImage} onChange={(v) => set("heroImage", v ?? seedSiteContent().heroImage)} aspect="aspect-[4/5]" />
              </CardBody>
            </Card>
            <Card className="overflow-hidden">
              <div className="bg-ivory p-5">
                <p className="eyebrow">{draft.heroEyebrow}</p>
                <p className="mt-2 font-serif text-2xl leading-tight">{draft.heroTitle}</p>
                <p className="mt-2 line-clamp-3 text-[12.5px] text-muted">{draft.heroSubtitle}</p>
                <p className="mt-3 text-[11px] text-subtle">Pré-visualização do topo do site</p>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {section === "identidade" ? (
        <Card>
          <CardBody className="grid gap-6 md:grid-cols-[260px_1fr]">
            <Field label="Logo" hint="PNG com fundo transparente. Sem logo enviado, o site usa o monograma padrão.">
              <ImageUpload value={draft.logo} onChange={(v) => set("logo", v)} aspect="aspect-[3/1]" label="Enviar logo" />
            </Field>
            <div className="grid content-start gap-4 sm:grid-cols-2">
              <Field label="Nome da marca" htmlFor="c-brand">
                <Input id="c-brand" value={draft.brandName} onChange={(e) => set("brandName", e.target.value)} />
              </Field>
              <Field label="Assinatura" htmlFor="c-tag">
                <Input id="c-tag" value={draft.brandTagline} onChange={(e) => set("brandTagline", e.target.value)} />
              </Field>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {section === "clinica" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
          <Card>
            <CardBody className="grid gap-4">
              <Field label="Título" htmlFor="c-ctitle">
                <Input id="c-ctitle" value={draft.clinicTitle} onChange={(e) => set("clinicTitle", e.target.value)} />
              </Field>
              <Field label="Texto" htmlFor="c-ctext">
                <Textarea id="c-ctext" rows={5} value={draft.clinicText} onChange={(e) => set("clinicText", e.target.value)} />
              </Field>
              <div>
                <p className="mb-2 text-[13px] font-medium text-ink-2">Números da clínica</p>
                <div className="space-y-2">
                  {draft.clinicStats.map((s) => (
                    <div key={s.id} className="grid grid-cols-[100px_1fr_36px] gap-2">
                      <Input aria-label="Valor" value={s.value} onChange={(e) => set("clinicStats", draft.clinicStats.map((x) => (x.id === s.id ? { ...x, value: e.target.value } : x)))} />
                      <Input aria-label="Descrição" value={s.label} onChange={(e) => set("clinicStats", draft.clinicStats.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))} />
                      <Button variant="ghost" size="icon" aria-label="Remover número" onClick={() => set("clinicStats", draft.clinicStats.filter((x) => x.id !== s.id))}>
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                  {draft.clinicStats.length < 4 ? (
                    <Button variant="ghost" size="sm" onClick={() => set("clinicStats", [...draft.clinicStats, { id: createId("st"), value: "", label: "" }])}>
                      <Plus /> Adicionar número
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Imagem da clínica" />
            <CardBody>
              <ImageUpload value={draft.clinicImage} onChange={(v) => set("clinicImage", v ?? seedSiteContent().clinicImage)} aspect="aspect-[4/5]" />
            </CardBody>
          </Card>
        </div>
      ) : null}

      {section === "depoimentos" ? (
        <div className="space-y-3">
          <p className="text-[13px] text-muted">Recomendamos até 3 depoimentos reais, com autorização dos pacientes.</p>
          {draft.testimonials.map((t) => (
            <Card key={t.id}>
              <CardBody className="grid gap-4 md:grid-cols-[1fr_1fr_120px_auto]">
                <Field label="Nome exibido" htmlFor={`t-name-${t.id}`}>
                  <Input id={`t-name-${t.id}`} value={t.name} onChange={(e) => set("testimonials", draft.testimonials.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)))} />
                </Field>
                <Field label="Tratamento" htmlFor={`t-trt-${t.id}`}>
                  <Input id={`t-trt-${t.id}`} value={t.treatment} onChange={(e) => set("testimonials", draft.testimonials.map((x) => (x.id === t.id ? { ...x, treatment: e.target.value } : x)))} />
                </Field>
                <Field label="Nota" htmlFor={`t-rate-${t.id}`}>
                  <Select id={`t-rate-${t.id}`} value={t.rating} onChange={(e) => set("testimonials", draft.testimonials.map((x) => (x.id === t.id ? { ...x, rating: Number(e.target.value) } : x)))}>
                    {[5, 4, 3].map((n) => (
                      <option key={n} value={n}>
                        {n} estrelas
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="flex items-end gap-3 pb-1">
                  <Switch checked={t.published} onChange={(v) => set("testimonials", draft.testimonials.map((x) => (x.id === t.id ? { ...x, published: v } : x)))} label="Publicado" />
                  <Button variant="ghost" size="icon" aria-label="Excluir depoimento" onClick={() => set("testimonials", draft.testimonials.filter((x) => x.id !== t.id))}>
                    <Trash2 />
                  </Button>
                </div>
                <Field label="Depoimento" htmlFor={`t-text-${t.id}`} className="md:col-span-4">
                  <Textarea id={`t-text-${t.id}`} rows={2} value={t.text} onChange={(e) => set("testimonials", draft.testimonials.map((x) => (x.id === t.id ? { ...x, text: e.target.value } : x)))} />
                </Field>
              </CardBody>
            </Card>
          ))}
          <Button variant="secondary" onClick={() => set("testimonials", [...draft.testimonials, { id: createId("tst"), name: "", treatment: "", text: "", rating: 5, published: false }])}>
            <Star /> Adicionar depoimento
          </Button>
        </div>
      ) : null}

      {section === "contato" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Canais de contato" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Telefone" htmlFor="c-phone">
                <Input id="c-phone" value={maskPhone(draft.phone)} onChange={(e) => set("phone", onlyDigits(e.target.value))} />
              </Field>
              <Field label="WhatsApp" htmlFor="c-wa">
                <Input id="c-wa" value={maskPhone(draft.whatsapp)} onChange={(e) => set("whatsapp", onlyDigits(e.target.value))} />
              </Field>
              <Field label="E-mail" htmlFor="c-email">
                <Input id="c-email" type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Instagram" htmlFor="c-ig" hint="Somente o usuário, sem @">
                <Input id="c-ig" value={draft.instagram} onChange={(e) => set("instagram", e.target.value.replace("@", ""))} />
              </Field>
              <Field label="Endereço" htmlFor="c-addr" className="sm:col-span-2">
                <Input id="c-addr" value={draft.address} onChange={(e) => set("address", e.target.value)} />
              </Field>
              <Field label="Cidade / UF" htmlFor="c-city">
                <Input id="c-city" value={draft.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field label="Link do Google Maps" htmlFor="c-maps">
                <Input id="c-maps" value={draft.mapsUrl} onChange={(e) => set("mapsUrl", e.target.value)} />
              </Field>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Horários de funcionamento" />
            <CardBody className="space-y-2">
              {draft.hours.map((h) => (
                <div key={h.id} className="grid grid-cols-[1fr_1fr_36px] gap-2">
                  <Input aria-label="Dias" value={h.label} onChange={(e) => set("hours", draft.hours.map((x) => (x.id === h.id ? { ...x, label: e.target.value } : x)))} />
                  <Input aria-label="Horário" value={h.hours} onChange={(e) => set("hours", draft.hours.map((x) => (x.id === h.id ? { ...x, hours: e.target.value } : x)))} />
                  <Button variant="ghost" size="icon" aria-label="Remover horário" onClick={() => set("hours", draft.hours.filter((x) => x.id !== h.id))}>
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => set("hours", [...draft.hours, { id: createId("h"), label: "", hours: "" }])}>
                <Plus /> Adicionar horário
              </Button>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {section === "seo" ? (
        <Card>
          <CardBody className="grid gap-4 lg:grid-cols-[1fr_420px]">
            <div className="space-y-4">
              <Field label="Título da página (title)" htmlFor="c-seot" hint={`${draft.seoTitle.length}/60 caracteres`}>
                <Input id="c-seot" value={draft.seoTitle} maxLength={70} onChange={(e) => set("seoTitle", e.target.value)} />
              </Field>
              <Field label="Descrição (meta description)" htmlFor="c-seod" hint={`${draft.seoDescription.length}/160 caracteres`}>
                <Textarea id="c-seod" rows={3} maxLength={180} value={draft.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
              </Field>
            </div>
            <div className="rounded-[12px] border border-line p-4">
              <p className="text-[11px] text-subtle">Prévia no Google</p>
              <p className="mt-2 text-[12px] text-[#202124]">oralclin.com.br</p>
              <p className="truncate text-[18px] text-[#1a0dab]">{draft.seoTitle}</p>
              <p className="line-clamp-2 text-[13px] text-[#4d5156]">{draft.seoDescription}</p>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {section === "catalogo" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { href: "/admin/tratamentos", icon: <Sparkles />, title: "Tratamentos", text: "Cards, páginas individuais, preços e destaques da home." },
            { href: "/admin/profissionais", icon: <Stethoscope />, title: "Profissionais", text: "Fotos, biografias e quem aparece no site." },
            { href: "/admin/antes-depois", icon: <Images />, title: "Antes e Depois", text: "Casos publicados na galeria interativa." },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="group rounded-[14px] border border-line bg-white p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-soft)]">
              <span className="flex size-10 items-center justify-center rounded-full bg-gold-soft text-gold-dark [&_svg]:size-5">{c.icon}</span>
              <p className="mt-4 flex items-center gap-1 text-[15px] font-semibold">
                {c.title} <ArrowUpRight className="size-4 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </p>
              <p className="mt-1 text-[13px] text-muted">{c.text}</p>
            </Link>
          ))}
        </div>
      ) : null}

      {dirty ? (
        <div className="sticky bottom-4 z-30 mt-6 flex items-center justify-between gap-3 rounded-[14px] border border-line bg-ink px-4 py-3 text-white shadow-[var(--shadow-pop)]">
          <p className="text-[13px]">Você tem alterações não publicadas.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setDraft(data)}>
              Descartar
            </Button>
            <Button size="sm" variant="gold" onClick={save} loading={saving}>
              Publicar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
