import { repositories } from "@/repositories";
import type { WhatsappTemplate } from "@/features/settings/types";
import { fillTemplate, whatsappLink } from "@/utils/whatsapp";

export type TemplateVariables = { nome?: string; data?: string; hora?: string; profissional?: string; tratamento?: string };

export const whatsappService = {
  async templates(): Promise<WhatsappTemplate[]> {
    return (await repositories.settings.get()).whatsapp.templates;
  },

  async render(key: WhatsappTemplate["key"], variables: TemplateVariables): Promise<string> {
    const template = (await whatsappService.templates()).find((t) => t.key === key);
    return template ? fillTemplate(template.body, variables) : "";
  },

  /** Hoje gera link wa.me. Ponto de integração com a API oficial (Cloud API) no futuro. */
  link(phone: string, message: string): string {
    return whatsappLink(phone, message);
  },
};
