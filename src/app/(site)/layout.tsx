import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WhatsappFloat } from "@/components/site/whatsapp-float";
import { SitePublicDataProvider } from "@/features/site/public-data";
import { getPublicSiteData } from "@/server/public-data";

// Conteúdo lido do banco a cada requisição: alterações do painel aparecem no site imediatamente.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const data = await getPublicSiteData();
  return (
    <SitePublicDataProvider data={data}>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-white">
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo">{children}</main>
      <SiteFooter />
      <WhatsappFloat />
    </SitePublicDataProvider>
  );
}
