import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TreatmentDetail } from "@/features/site/components/treatment-detail";
import { getPublicSiteData } from "@/server/public-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = (await getPublicSiteData()).treatments.find((x) => x.slug === slug);
  if (!t) return { title: "Tratamento" };
  return {
    title: t.name,
    description: `${t.shortDescription} ${t.description.slice(0, 110)}…`,
    alternates: { canonical: `/tratamentos/${t.slug}` },
    openGraph: { title: `${t.name} | Oralclin`, description: t.shortDescription },
  };
}

export default async function TreatmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const treatment = (await getPublicSiteData()).treatments.find((t) => t.slug === slug);
  if (!treatment) notFound();
  return <TreatmentDetail treatment={treatment} />;
}
