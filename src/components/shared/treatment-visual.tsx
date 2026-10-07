import { AudioLines, HeartPulse } from "lucide-react";
import type { ReactNode } from "react";
import { IMAGES, imageFocus, treatmentImage } from "@/data/images";
import type { TreatmentCategory } from "@/features/treatments/types";
import { cn } from "@/utils/cn";
import { SafeImage } from "./safe-image";

interface Props {
  slug?: string;
  category: TreatmentCategory;
  name: string;
  image?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/** Áreas não odontológicas: sem foto cadastrada, exibem uma arte da marca em vez da imagem reserva (um dente). */
const AREA_ART: Partial<Record<TreatmentCategory, { icon: ReactNode; gradient: string }>> = {
  fonoaudiologia: {
    icon: <AudioLines />,
    gradient: "radial-gradient(120% 90% at 25% 15%, #f7f3ea 0%, #e7ddc8 50%, #c9b58c 100%)",
  },
  ginecologia: {
    icon: <HeartPulse />,
    gradient: "radial-gradient(120% 90% at 25% 15%, #f8f1ef 0%, #ead8d2 50%, #c7a49a 100%)",
  },
};

/**
 * Imagem do tratamento. Usa a imagem cadastrada no painel; na ausência,
 * a imagem padrão do tratamento em /public/images/treatments (ou a arte da área);
 * e, se tudo falhar, a imagem reserva da marca. Nunca renderiza área vazia.
 */
export function TreatmentVisual({ slug, category, name, image, className, sizes = "(max-width: 768px) 100vw, 400px", priority }: Props) {
  const art = AREA_ART[category];
  if (art && (!image || image === IMAGES.fallback.treatment)) {
    return (
      <div className={cn("relative overflow-hidden", className)} style={{ background: art.gradient }} role="img" aria-label={name}>
        <svg className="absolute left-1/2 top-1/2 h-[170%] -translate-x-1/2 -translate-y-1/2 text-white/50" viewBox="0 0 200 200" fill="none" aria-hidden>
          <circle cx="100" cy="100" r="28" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="48" stroke="currentColor" strokeWidth="0.4" />
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="100" cy="100" r="94" stroke="currentColor" strokeWidth="0.25" />
        </svg>
        <span className="absolute left-1/2 top-1/2 flex aspect-square w-[22%] min-w-10 max-w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gold-dark shadow-[0_20px_40px_-20px_rgba(32,32,32,0.5)] backdrop-blur [&_svg]:size-[45%]">
          {art.icon}
        </span>
      </div>
    );
  }

  const src = image || treatmentImage(slug);
  return (
    <div className={cn("relative overflow-hidden bg-sand", className)}>
      <SafeImage
        src={src}
        alt={name}
        fill
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: imageFocus(src) }}
        priority={priority}
        fallback="treatment"
      />
    </div>
  );
}
