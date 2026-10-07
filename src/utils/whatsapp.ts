import { onlyDigits } from "./format";

/** Gera link wa.me — ponto único para trocar por API oficial do WhatsApp no futuro. */
export function whatsappLink(phone: string, message?: string): string {
  let digits = onlyDigits(phone);
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

/** Substitui variáveis no formato {nome}, {data}, {hora}. */
export function fillTemplate(template: string, variables: Record<string, string | number | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = variables[key];
    return value === undefined || value === "" ? match : String(value);
  });
}
