"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
  tone?: "dark" | "light";
  compact?: boolean;
  logoUrl?: string | null;
  showTagline?: boolean;
}

/** Monograma original da plataforma (arco champagne). Substituível pelo logo enviado no CMS. */
export function LogoMark({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden>
      <circle cx="20" cy="20" r="19" fill={tone === "dark" ? "#FAF9F7" : "rgba(255,255,255,0.06)"} stroke="#D6C39C" strokeWidth="1" />
      <path
        d="M27.5 12.2A10 10 0 1 0 27.6 27.7"
        fill="none"
        stroke="#B69A67"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M22.4 15.2c-1.6 1.8-2.1 4.4-1.2 6.8.6 1.6 1.8 2.9 3.3 3.6" fill="none" stroke="#B69A67" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function Logo({ className, tone = "dark", compact, logoUrl, showTagline = true }: LogoProps) {
  const [failed, setFailed] = useState(false);
  if (logoUrl && !failed) {
    return (
      <span className={cn("relative block h-10 w-36", className)}>
        <Image src={logoUrl} alt="Oralclin" fill sizes="144px" className="object-contain object-left" unoptimized={logoUrl.startsWith("data:")} onError={() => setFailed(true)} />
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark tone={tone} />
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className={cn("whitespace-nowrap text-[15px] font-semibold tracking-[0.2em]", tone === "dark" ? "text-ink" : "text-white")}>ORALCLIN</span>
          {showTagline ? (
            <span className="mt-1 whitespace-nowrap text-[8.5px] font-medium uppercase tracking-[0.28em] text-gold">Odontologia e Saúde</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
