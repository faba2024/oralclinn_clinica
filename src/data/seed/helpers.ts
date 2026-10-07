import { addDays, format, subDays } from "date-fns";

/** Datas relativas ao primeiro carregamento — a demonstração sempre parece atual. */
export function dayOffset(offset: number): string {
  const base = new Date();
  return format(offset >= 0 ? addDays(base, offset) : subDays(base, Math.abs(offset)), "yyyy-MM-dd");
}

export function isoOffset(offsetDays: number, time = "10:00"): string {
  const [h, m] = time.split(":").map(Number);
  const date = offsetDays >= 0 ? addDays(new Date(), offsetDays) : subDays(new Date(), Math.abs(offsetDays));
  date.setHours(h, m, 0, 0);
  return date.toISOString();
}

/** PRNG determinístico (mulberry32) para gerar históricos coerentes. */
export function createRandom(seed: number) {
  let t = seed >>> 0;
  const next = () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T,>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
  };
}

export function stamp(offsetDays: number, time = "09:00") {
  const iso = isoOffset(offsetDays, time);
  return { createdAt: iso, updatedAt: iso };
}
