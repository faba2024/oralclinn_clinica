import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { SetupRequired } from "@/components/admin/setup-required";
import type { SessionUser } from "@/features/users/types";
import { StorageNotConfiguredError } from "@/server/store";
import { getServerSessionUser } from "@/server/session";

export const dynamic = "force-dynamic";

/** Todo o painel exige sessão válida, verificada no servidor a cada acesso. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  let user: SessionUser | null;
  try {
    user = await getServerSessionUser();
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) return <SetupRequired message={error.message} />;
    throw error;
  }
  // Cookie assinado porém usuário removido/desativado: limpa a sessão e volta ao login.
  if (!user) redirect("/api/auth/logout");
  return <AdminShell initialUser={user}>{children}</AdminShell>;
}
