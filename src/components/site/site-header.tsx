"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/shared/brand";
import { buttonVariants } from "@/components/ui/button";
import { useSiteContent } from "@/features/site/hooks";
import { cn } from "@/utils/cn";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/tratamentos", label: "Tratamentos" },
  { href: "/antes-e-depois", label: "Antes e Depois" },
  { href: "/profissionais", label: "Profissionais" },
  { href: "/clinica", label: "Clínica" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const content = useSiteContent();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  // Na home o topo fica sobre o hero escuro: header claro até começar a rolar.
  const light = pathname === "/" && !scrolled && !open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,backdrop-filter,height] duration-500",
        scrolled || open ? "bg-ivory/80 shadow-[0_1px_0_var(--color-line),0_10px_30px_-20px_rgba(32,32,32,0.25)] backdrop-blur-xl backdrop-saturate-150" : "bg-transparent",
      )}
    >
      <div className={cn("mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 transition-[height] duration-500 sm:px-8", scrolled ? "h-[68px]" : "h-[84px]")}>
        <Link href="/" aria-label="Oralclin — página inicial" className="shrink-0">
          <Logo logoUrl={content.logo} tone={light ? "light" : "dark"} />
        </Link>
        <nav aria-label="Navegação principal" className={cn("hidden items-center gap-0.5 rounded-full p-1 lg:flex", light ? "border border-white/10 bg-white/[0.06] backdrop-blur" : "")}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "relative whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium transition-colors xl:px-4 xl:text-[13.5px]",
                l.href === "/" && "hidden xl:block",
                light
                  ? isActive(l.href)
                    ? "bg-white/12 text-white"
                    : "text-white/70 hover:text-white"
                  : isActive(l.href)
                    ? "bg-sand text-ink"
                    : "text-muted hover:bg-sand/60 hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/agendar"
            className={buttonVariants({
              variant: light ? "gold" : "primary",
              size: "md",
              className: "group hidden h-10 rounded-full pl-5 pr-4 sm:inline-flex",
            })}
          >
            Agendar avaliação <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={cn("flex size-10 items-center justify-center rounded-full lg:hidden", light ? "text-white hover:bg-white/10" : "text-ink hover:bg-sand")}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="menu-mobile" className="h-[calc(100dvh-84px)] animate-fade-in overflow-y-auto border-t border-line bg-ivory px-5 pb-10 pt-6 lg:hidden">
          <nav aria-label="Menu mobile" className="flex flex-col">
            {LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                style={{ animationDelay: `${i * 40}ms` }}
                className={cn("flex animate-rise items-center justify-between border-b border-line py-4 font-serif text-[28px] transition-colors", isActive(l.href) ? "text-gold-dark" : "text-ink")}
              >
                {l.label}
                <ArrowRight className="size-5 text-champagne" />
              </Link>
            ))}
          </nav>
          <Link href="/agendar" className={buttonVariants({ variant: "primary", size: "xl", className: "mt-8 w-full rounded-full" })}>
            Agendar avaliação
          </Link>
        </div>
      ) : null}
    </header>
  );
}
