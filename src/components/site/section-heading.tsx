import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface Props {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  action?: ReactNode;
}

export function SectionHeading({ eyebrow, title, description, align = "left", className, action }: Props) {
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", align === "center" && "items-center text-center md:flex-col md:items-center", className)}>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-4 text-balance font-serif text-[36px] leading-[1.06] tracking-[-0.015em] text-ink sm:text-[52px]">{title}</h2>
        {description ? <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageHero({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-ivory pb-16 pt-36 sm:pb-24 sm:pt-48">
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[620px] rounded-full bg-champagne/35 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-60 -left-40 -z-10 size-[520px] rounded-full bg-gold-soft blur-[100px]" aria-hidden />
      <svg className="pointer-events-none absolute -right-24 -top-16 -z-10 size-[560px] text-champagne" viewBox="0 0 200 200" fill="none" aria-hidden>
        <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="0.3" />
        <circle cx="100" cy="100" r="76" stroke="currentColor" strokeWidth="0.3" />
        <circle cx="100" cy="100" r="54" stroke="currentColor" strokeWidth="0.3" />
      </svg>
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <p className="inline-flex animate-rise items-center gap-3 eyebrow">
          <span className="h-px w-8 bg-gold" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="mt-6 max-w-4xl animate-rise text-balance font-serif text-[44px] leading-[1.03] tracking-[-0.02em] [animation-delay:60ms] sm:text-[68px]">{title}</h1>
        {description ? <p className="mt-7 max-w-xl animate-rise text-[17px] leading-relaxed text-muted [animation-delay:120ms]">{description}</p> : null}
        {children}
      </div>
    </section>
  );
}
