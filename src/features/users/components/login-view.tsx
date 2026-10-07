"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Logo } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { authService } from "@/features/users/service";

const schema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

type FormValues = z.infer<typeof schema>;

export function LoginView() {
  const params = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Destino capturado uma única vez: evita redirecionar duas vezes durante a troca de rota.
  const [destination] = useState(() => {
    const next = params.get("next");
    return next && next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await authService.login(values.email, values.password);
      // Navegação completa: o servidor lê o cookie de sessão recém-criado e libera o painel.
      window.location.assign(destination);
      await new Promise(() => undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="grain relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <svg className="pointer-events-none absolute -right-40 -top-40 size-[640px] opacity-[0.16]" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r="98" fill="none" stroke="#D6C39C" strokeWidth="0.4" />
          <circle cx="100" cy="100" r="74" fill="none" stroke="#D6C39C" strokeWidth="0.4" />
          <path d="M150 60A60 60 0 1 0 150 140" fill="none" stroke="#B69A67" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <Logo tone="light" />
        <div className="relative max-w-md">
          <p className="eyebrow text-champagne">Plataforma Oralclin</p>
          <h1 className="mt-4 font-serif text-[44px] leading-[1.08] tracking-[-0.01em]">
            Cada sorriso, <em className="text-champagne">acompanhado</em> do primeiro contato ao último retorno.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/60">
            Agenda, prontuário, planos de tratamento, financeiro e relacionamento — integrados em um só lugar.
          </p>
        </div>
        <div className="relative flex items-center gap-6 text-[12px] text-white/45">
          <span>Agenda inteligente</span>
          <span className="size-1 rounded-full bg-gold" />
          <span>Prontuário digital</span>
          <span className="size-1 rounded-full bg-gold" />
          <span>Gestão financeira</span>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-ivory px-5 py-12 sm:px-8">
        <div className="w-full max-w-[400px] animate-rise">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">Acessar o painel</h2>
          <p className="mt-1.5 text-sm text-muted">Entre com suas credenciais para continuar.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@oralclin.com"
                leading={<Mail />}
                aria-invalid={!!errors.email}
                className="h-11"
                {...register("email")}
              />
            </Field>
            <Field label="Senha" htmlFor="password" error={errors.password?.message}>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                leading={<Lock />}
                aria-invalid={!!errors.password}
                className="h-11"
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="rounded-md p-1 text-subtle hover:text-ink"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
                {...register("password")}
              />
            </Field>
            {error ? (
              <p role="alert" className="rounded-[10px] bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
                {error}
              </p>
            ) : null}
            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              Entrar <ArrowRight />
            </Button>
          </form>

          <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-relaxed text-subtle">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-dark" />
            Acesso restrito à equipe da clínica. A sessão é encerrada automaticamente após 12 horas.
          </p>

          <p className="mt-8 text-center text-[12.5px] text-subtle">
            <Link href="/" className="hover:text-ink">← Voltar ao site</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
