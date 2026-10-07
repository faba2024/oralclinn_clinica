import type { MetadataRoute } from "next";
import { getPublicSiteData } from "@/server/public-data";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oralclin.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages = ["", "/tratamentos", "/antes-e-depois", "/profissionais", "/clinica", "/contato", "/agendar"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  let slugs: string[] = [];
  try {
    slugs = (await getPublicSiteData()).treatments.map((t) => t.slug);
  } catch {
    slugs = [];
  }
  const treatments = slugs.map((slug) => ({
    url: `${SITE_URL}/tratamentos/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...pages, ...treatments];
}
