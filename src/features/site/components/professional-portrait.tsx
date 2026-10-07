import { SafeImage } from "@/components/shared/safe-image";
import { IMAGES, resolveImagePath } from "@/data/images";
import type { Professional } from "@/features/professionals/types";
import { cn } from "@/utils/cn";

/** Retratos ilustrados temporários: enquanto estiverem em uso, exibimos um monograma da marca. */
const PLACEHOLDER_PORTRAITS = new Set<string>([...Object.values(IMAGES.professionals), IMAGES.fallback.avatar]);

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Retrato do profissional (foto cadastrada ou monograma elegante). */
export function ProfessionalPortrait({ professional, className, showCro = true, sizes = "(max-width: 768px) 90vw, 380px" }: { professional: Professional; className?: string; showCro?: boolean; sizes?: string }) {
  const src = professional.photo || IMAGES.professionals[professional.id] || IMAGES.fallback.avatar;
  const isPlaceholder = PLACEHOLDER_PORTRAITS.has(resolveImagePath(src));

  return (
    <div className={cn("@container relative aspect-[4/5] overflow-hidden rounded-[22px] bg-sand", className)}>
      {isPlaceholder ? (
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_10%,#fbf8f2_0%,#efe6d6_45%,#dccaa6_100%)]" role="img" aria-label={`${professional.title} ${professional.name}`}>
          <svg className="absolute left-1/2 top-[44%] h-[150%] -translate-x-1/2 -translate-y-1/2 text-gold/30" viewBox="0 0 200 200" fill="none" aria-hidden>
            <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="100" cy="100" r="58" stroke="currentColor" strokeWidth="0.3" />
            <circle cx="100" cy="100" r="78" stroke="currentColor" strokeWidth="0.25" />
            <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="0.2" />
          </svg>
          <span className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 font-serif text-[30cqw] italic leading-none text-gold-dark/90">
            {initials(professional.name)}
          </span>
          <span className="absolute inset-x-0 bottom-[16%] hidden text-center text-[10.5px] @min-[200px]:block font-semibold uppercase tracking-[0.3em] text-gold-dark/70">{professional.specialty}</span>
        </div>
      ) : (
        <SafeImage src={src} alt={`${professional.title} ${professional.name}`} fill sizes={sizes} className="object-cover object-top" fallback="avatar" />
      )}
      {showCro && professional.cro ? (
        <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-ink-2 backdrop-blur">{professional.cro}</span>
      ) : null}
    </div>
  );
}
