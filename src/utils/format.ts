import { differenceInYears, format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const compactCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});
const numberFormatter = new Intl.NumberFormat("pt-BR");

export function formatCurrency(value: number | null | undefined): string {
  return currencyFormatter.format(Number.isFinite(value) ? (value as number) : 0);
}

export function formatCurrencyCompact(value: number): string {
  return compactCurrency.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits).replace(".", ",")}%`;
}

export function toDate(value: string | Date): Date {
  return value instanceof Date ? value : parseISO(value);
}

export function formatDate(value: string | Date | null | undefined, pattern = "dd/MM/yyyy"): string {
  if (!value) return "—";
  const date = toDate(value);
  return isValid(date) ? format(date, pattern, { locale: ptBR }) : "—";
}

export function formatDateLong(value: string | Date): string {
  return formatDate(value, "EEEE, d 'de' MMMM");
}

export function formatRelative(value: string | Date): string {
  const date = toDate(value);
  if (!isValid(date)) return "—";
  return formatDistanceToNowStrict(date, { locale: ptBR, addSuffix: true });
}

export function calculateAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const date = parseISO(birthDate);
  return isValid(date) ? differenceInYears(new Date(), date) : null;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string | null | undefined): string {
  if (!value) return "—";
  const digits = onlyDigits(value).replace(/^55(?=\d{10,11}$)/, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value;
}

export function formatCpf(value: string | null | undefined): string {
  if (!value) return "—";
  const d = onlyDigits(value);
  if (d.length !== 11) return value;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function maskCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function initials(name: string): string {
  const parts = name
    .replace(/^(dra?\.?)\s+/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function matchesSearch(term: string, ...fields: Array<string | null | undefined>): boolean {
  const needle = normalizeSearch(term);
  if (!needle) return true;
  const digits = onlyDigits(term);
  return fields.some((field) => {
    if (!field) return false;
    if (normalizeSearch(field).includes(needle)) return true;
    return digits.length >= 3 && onlyDigits(field).includes(digits);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}
