import Link from "next/link";
import { Logo } from "@/components/shared/brand";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ivory px-6 text-center">
      <svg className="pointer-events-none absolute size-[640px] text-champagne opacity-40" viewBox="0 0 200 200" fill="none" aria-hidden>
        <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="0.3" />
        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.3" />
      </svg>
      <div className="relative">
        <Logo className="justify-center" />
        <p className="mt-12 font-serif text-[96px] leading-none text-gold">404</p>
        <h1 className="mt-4 font-serif text-[32px]">Página não encontrada</h1>
        <p className="mx-auto mt-3 max-w-sm text-muted">O endereço pode ter mudado. Que tal voltar ao início ou agendar sua avaliação?</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonVariants({ variant: "secondary", size: "lg", className: "rounded-full" })}>
            Voltar ao início
          </Link>
          <Link href="/agendar" className={buttonVariants({ size: "lg", className: "rounded-full" })}>
            Agendar avaliação
          </Link>
        </div>
      </div>
    </main>
  );
}
