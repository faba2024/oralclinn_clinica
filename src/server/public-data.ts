import "./bootstrap";
import { cache } from "react";
import type { BeforeAfterCase } from "@/features/before-after/types";
import type { SiteContent } from "@/features/content/types";
import type { Professional } from "@/features/professionals/types";
import type { Treatment } from "@/features/treatments/types";
import { seedBeforeAfter, seedProfessionals, seedSettings, seedSiteContent, seedTreatments } from "@/data/seed";
import { repositories } from "@/repositories";

export interface PublicBookingSettings {
  allowOnlineBooking: boolean;
  workingDays: number[];
  onlineBookingLeadHours: number;
}

export interface PublicSiteData {
  content: SiteContent;
  treatments: Treatment[];
  professionals: Professional[];
  cases: BeforeAfterCase[];
  booking: PublicBookingSettings;
}

/** Remove dados internos (contato pessoal e comissão) antes de enviar ao navegador. */
function publicProfessional(p: Professional): Professional {
  return { ...p, phone: "", email: "", commissionRate: 0 };
}

/**
 * Dados do site público lidos do MESMO banco usado pelo painel.
 * O que é editado no painel (conteúdo, tratamentos, profissionais, casos,
 * regras de agendamento) aparece no site na próxima visita.
 */
function build(
  content: SiteContent,
  treatments: Treatment[],
  professionals: Professional[],
  cases: BeforeAfterCase[],
  agenda: { allowOnlineBooking: boolean; workingDays: number[]; onlineBookingLeadHours: number },
): PublicSiteData {
  return {
    content,
    treatments: treatments.filter((t) => t.active).sort((a, b) => a.order - b.order),
    professionals: professionals.filter((p) => p.status === "ativo" && p.showOnSite).map(publicProfessional),
    cases: cases.filter((c) => c.published),
    booking: {
      allowOnlineBooking: agenda.allowOnlineBooking,
      workingDays: agenda.workingDays,
      onlineBookingLeadHours: agenda.onlineBookingLeadHours,
    },
  };
}

/**
 * Dados do site público lidos do MESMO banco usado pelo painel.
 * O que é editado no painel (conteúdo, tratamentos, profissionais, casos,
 * regras de agendamento) aparece no site na próxima visita.
 * Se o banco estiver indisponível, o site continua no ar com o conteúdo padrão.
 */
export const getPublicSiteData = cache(async (): Promise<PublicSiteData> => {
  try {
    const [content, treatments, professionals, cases, settings] = await Promise.all([
      repositories.siteContent.get(),
      repositories.treatments.list(),
      repositories.professionals.list(),
      repositories.beforeAfter.list(),
      repositories.settings.get(),
    ]);
    return build(content, treatments, professionals, cases, settings.agenda);
  } catch (error) {
    console.error("[site] banco indisponível — exibindo conteúdo padrão:", error instanceof Error ? error.message : error);
    return build(seedSiteContent(), seedTreatments(), seedProfessionals(), seedBeforeAfter(), seedSettings().agenda);
  }
});
