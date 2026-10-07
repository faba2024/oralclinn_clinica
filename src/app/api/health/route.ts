import { getAuthSecret } from "@/server/auth/token";
import { serverEnv } from "@/server/env";
import { json } from "@/server/http";
import { getStore, storageStatus } from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Diagnóstico de configuração (sem expor segredos). */
export async function GET() {
  const status = storageStatus();
  let reachable = false;
  let message: string;
  try {
    await getStore().getDoc("__health");
    reachable = true;
    message =
      status.driver === "supabase"
        ? "Supabase conectado. Site e painel compartilham os mesmos dados."
        : "Banco local em arquivo (.data/oralclin-db.json) — use apenas em desenvolvimento. Na Vercel, configure o Supabase.";
  } catch (e) {
    message = e instanceof Error ? e.message : "Banco de dados indisponível.";
  }
  const auth = {
    secretConfigured: !!getAuthSecret(),
  };
  return json(
    {
      ok: reachable && auth.secretConfigured,
      storage: { kind: status.driver, persistent: status.driver === "supabase" || (status.driver === "file" && !serverEnv.isVercel), message },
      auth,
    },
    reachable ? 200 : 503,
  );
}
