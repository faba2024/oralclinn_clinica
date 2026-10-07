"use client";

import { SafeImage } from "@/components/shared/safe-image";
import { useState } from "react";
import { cn } from "@/utils/cn";

interface Props {
  before: string;
  after: string;
  alt: string;
  className?: string;
  aspect?: string;
  priority?: boolean;
}

/**
 * Comparação interativa antes/depois. O controle é um input range nativo
 * (acessível por teclado e leitores de tela) sobreposto à imagem.
 */
export function BeforeAfterSlider({ before, after, alt, className, aspect = "aspect-[16/10]", priority }: Props) {
  const [position, setPosition] = useState(50);

  return (
    <div className={cn("group relative w-full select-none overflow-hidden rounded-[14px] bg-sand", aspect, className)}>
      <SafeImage fallback="treatment" src={after} alt={`${alt} — depois`} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" priority={priority} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <SafeImage fallback="treatment" src={before} alt={`${alt} — antes`} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" priority={priority} />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
        Antes
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink backdrop-blur-sm">
        Depois
      </span>

      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${position}%` }}>
        <div className="absolute inset-y-0 -translate-x-1/2 border-l-2 border-white/90 shadow-[0_0_12px_rgba(0,0,0,0.25)]" />
        <div className="absolute top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 shadow-lg transition-transform duration-150 group-active:scale-95">
          <svg viewBox="0 0 24 24" className="size-4 text-ink" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label={`Comparar antes e depois: ${alt}`}
        aria-valuetext={`${position}% antes`}
        className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
      />
    </div>
  );
}
