import { Database } from "lucide-react";
import { Logo } from "@/components/shared/brand";

/** Exibida quando o banco de dados ainda não foi conectado no ambiente de produção. */
export function SetupRequired({ message }: { message: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-lg rounded-[18px] border border-line bg-white p-8 shadow-[var(--shadow-card)]">
        <Logo />
        <div className="mt-8 flex size-11 items-center justify-center rounded-full bg-warning-soft text-warning">
          <Database className="size-5" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Configuração pendente</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
        <p className="mt-4 text-[13px] leading-relaxed text-subtle">
          Depois de conectar o banco, faça um novo deploy (Deployments → Redeploy) e acesse novamente.
        </p>
      </div>
    </main>
  );
}
