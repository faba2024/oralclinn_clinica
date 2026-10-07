/**
 * Catálogo central de imagens do projeto (arquivos em /public/images).
 *
 * Para trocar uma imagem temporária por uma foto real, basta substituir o
 * arquivo mantendo o mesmo nome — ou enviar uma nova pelo painel
 * (Conteúdo, Tratamentos, Profissionais, Antes e Depois).
 */
export const IMAGES = {
  hero: "/images/hero/hero-oralclin.webp",
  clinic: "/images/clinic/fachada-oralclin.webp",
  og: "/images/og/og-oralclin.jpg",
  fallback: {
    treatment: "/images/treatments/fallback-treatment.webp",
    avatar: "/images/avatars/fallback-avatar.webp",
    clinic: "/images/clinic/fallback-clinic.webp",
  },
  professionals: {
    prof_camila: "/images/professionals/dra-camila.webp",
    prof_lucas: "/images/professionals/dr-lucas.webp",
    prof_beatriz: "/images/professionals/dra-beatriz.webp",
  } as Record<string, string>,
  beforeAfter: {
    facetasAntes: "/images/before-after/facetas-antes.webp",
    facetasDepois: "/images/before-after/facetas-depois.webp",
    reabilitacaoAntes: "/images/before-after/reabilitacao-antes.webp",
    reabilitacaoDepois: "/images/before-after/reabilitacao-depois.webp",
  },
} as const;

/** Slugs que possuem imagem própria em /public/images/treatments. */
const TREATMENT_IMAGE_SLUGS = new Set([
  "avaliacao",
  "facetas",
  "lentes-de-contato-dental",
  "implantes",
  "clareamento",
  "alinhadores-invisiveis",
  "ortodontia",
  "protese",
  "endodontia",
  "limpeza",
  "restauracao",
  "periodontia",
  "harmonizacao-orofacial",
]);

const SLUG_FILE: Record<string, string> = { "harmonizacao-orofacial": "harmonizacao" };

export function treatmentImage(slug: string | undefined): string {
  if (!slug || !TREATMENT_IMAGE_SLUGS.has(slug)) return IMAGES.fallback.treatment;
  return `/images/treatments/${SLUG_FILE[slug] ?? slug}.webp`;
}

/**
 * Caminhos antigos que podem estar gravados em registros do banco criados
 * antes da reorganização dos arquivos. São convertidos para o caminho atual.
 */
const LEGACY_IMAGE_PATHS: Record<string, string> = {
  "/images/professionals/dra-camila-andrade.webp": "/images/professionals/dra-camila.webp",
  "/images/professionals/dr-lucas-ferreira.webp": "/images/professionals/dr-lucas.webp",
  "/images/professionals/dra-beatriz-lemos.webp": "/images/professionals/dra-beatriz.webp",
};

export function resolveImagePath(src: string): string {
  return LEGACY_IMAGE_PATHS[src] ?? src;
}

/**
 * Ponto focal de cada fotografia padrão (object-position). Usado quando a
 * foto aparece em formatos diferentes do original (ex.: 4:5 na página do
 * tratamento), para manter rosto, sorriso e procedimento dentro do recorte.
 * Imagens enviadas pelo painel usam o enquadramento central.
 */
const IMAGE_FOCUS: Record<string, string> = {
  "/images/hero/hero-oralclin.webp": "50% 40%",
  "/images/treatments/avaliacao.webp": "40% 45%",
  "/images/treatments/facetas.webp": "50% 50%",
  "/images/treatments/lentes-de-contato-dental.webp": "50% 50%",
  "/images/treatments/implantes.webp": "62% 45%",
  "/images/treatments/clareamento.webp": "46% 45%",
  "/images/treatments/alinhadores-invisiveis.webp": "36% 40%",
  "/images/treatments/ortodontia.webp": "78% 45%",
  "/images/treatments/protese.webp": "55% 40%",
  "/images/treatments/endodontia.webp": "40% 45%",
  "/images/treatments/limpeza.webp": "32% 45%",
  "/images/treatments/restauracao.webp": "40% 50%",
  "/images/treatments/periodontia.webp": "55% 45%",
  "/images/treatments/harmonizacao.webp": "45% 40%",
  "/images/clinic/fachada-oralclin.webp": "50% 35%",
};

export function imageFocus(src: string | null | undefined): string | undefined {
  return src ? IMAGE_FOCUS[resolveImagePath(src)] : undefined;
}
