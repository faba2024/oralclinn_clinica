"use client";

import { Check, KeyRound, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Field, Input, Select } from "@/components/ui/input";
import { useUsers } from "@/features/users/hooks";
import { MODULE_LABELS, ROLE_PERMISSIONS } from "@/features/users/permissions";
import { userService } from "@/features/users/service";
import { USER_ROLE_LABELS, USER_ROLES, type ModuleKey, type User, type UserRole } from "@/features/users/types";
import { useLookups } from "@/hooks/use-lookups";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";
import { formatRelative } from "@/utils/format";

type Draft = Pick<User, "name" | "email" | "role" | "active" | "professionalId"> & { password: string };
const EMPTY: Draft = { name: "", email: "", password: "", role: "recepcao", active: true, professionalId: null };

function UserDialog({ open, onClose, user }: { open: boolean; onClose: () => void; user: User | null }) {
  const lookups = useLookups();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setDraft(user ? { name: user.name, email: user.email, password: "", role: user.role, active: user.active, professionalId: user.professionalId } : EMPTY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

  const save = async () => {
    if (draft.name.trim().length < 3) return setError("Informe o nome.");
    if (!/^\S+@\S+\.\S+$/.test(draft.email)) return setError("E-mail inválido.");
    if (!user || draft.password) {
      if (draft.password.length < 8) return setError("A senha deve ter pelo menos 8 caracteres.");
      if (!/[A-Za-z]/.test(draft.password) || !/\d/.test(draft.password)) return setError("Use letras e números na senha.");
    }
    setSaving(true);
    try {
      const { password, ...rest } = draft;
      if (user) await userService.update(user.id, password ? draft : rest);
      else await userService.create(draft);
      toast.success(user ? "Usuário atualizado" : "Usuário criado", draft.name);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={user ? "Editar usuário" : "Novo usuário"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} loading={saving}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" htmlFor="u-name" className="sm:col-span-2">
          <Input id="u-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </Field>
        <Field label="E-mail de acesso" htmlFor="u-email">
          <Input id="u-email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
        </Field>
        <Field
          label={user ? "Nova senha" : "Senha inicial"}
          htmlFor="u-pass"
          hint={user ? "Deixe em branco para manter a senha atual." : "Mínimo de 8 caracteres, com letras e números."}
        >
          <Input id="u-pass" type="password" autoComplete="new-password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
        </Field>
        <Field label="Perfil" htmlFor="u-role">
          <Select id="u-role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as UserRole })}>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {USER_ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Profissional vinculado" htmlFor="u-prof">
          <Select id="u-prof" value={draft.professionalId ?? ""} onChange={(e) => setDraft({ ...draft, professionalId: e.target.value || null })} disabled={draft.role !== "dentista"}>
            <option value="">Nenhum</option>
            {lookups.professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Switch checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} label="Acesso ativo" description="Usuários inativos não conseguem entrar no painel." />
        </div>
        {error ? (
          <p role="alert" className="rounded-[10px] bg-danger-soft px-3 py-2 text-[13px] text-danger sm:col-span-2">
            {error}
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}

export function UsersPanel() {
  const { data: users = [] } = useUsers();
  const session = useAuthStore((s) => s.user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const modules = Object.keys(MODULE_LABELS) as ModuleKey[];

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Usuário",
      sortValue: (u) => u.name,
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={u.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium">
              {u.name} {u.id === session?.id ? <span className="text-[11px] text-subtle">(você)</span> : null}
            </p>
            <p className="truncate text-[12px] text-subtle">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Perfil", sortValue: (u) => u.role, cell: (u) => <Badge tone={u.role === "admin" ? "gold" : "neutral"}>{USER_ROLE_LABELS[u.role]}</Badge> },
    { key: "status", header: "Status", cell: (u) => <Badge tone={u.active ? "success" : "neutral"} dot>{u.active ? "Ativo" : "Inativo"}</Badge> },
    { key: "login", header: "Último acesso", sortValue: (u) => u.lastLoginAt ?? "", cell: (u) => <span className="text-muted">{u.lastLoginAt ? formatRelative(u.lastLoginAt) : "Nunca acessou"}</span> },
    {
      key: "actions",
      header: "",
      cell: (u) => (
        <DropdownMenu
          items={[
            { label: "Editar", icon: <Pencil />, onSelect: () => { setEditing(u); setDialogOpen(true); } },
            { label: "Definir nova senha", icon: <KeyRound />, onSelect: () => { setEditing(u); setDialogOpen(true); } },
            { label: "Excluir", icon: <Trash2 />, danger: true, separatorBefore: true, disabled: u.id === session?.id, onSelect: () => setToDelete(u) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader
          title="Usuários"
          description="Acesso ao painel por perfil. As senhas são guardadas apenas como hash no servidor."
          action={
            <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
              <Plus /> Novo usuário
            </Button>
          }
        />
        <CardBody className="px-0 pb-0">
          <DataTable
            rows={users}
            columns={columns}
            getRowId={(u) => u.id}
            mobileCard={(u) => (
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar name={u.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">{u.name}</p>
                    <p className="truncate text-[12px] text-subtle">{u.email}</p>
                  </div>
                </div>
                <Badge tone={u.role === "admin" ? "gold" : "neutral"}>{USER_ROLE_LABELS[u.role]}</Badge>
              </div>
            )}
            onRowClick={(u) => { setEditing(u); setDialogOpen(true); }}
          />
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Permissões por perfil" description="Matriz aplicada ao menu e às rotas do painel." />
        <CardBody className="px-0 pb-0">
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[640px] text-[12.5px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle">Módulo</th>
                  {USER_ROLES.map((r) => (
                    <th key={r} className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle">
                      {USER_ROLE_LABELS[r]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-2 font-medium">{MODULE_LABELS[m]}</td>
                    {USER_ROLES.map((r) => (
                      <td key={r} className="px-3 py-2 text-center">
                        {ROLE_PERMISSIONS[r].includes(m) ? (
                          <Check className="mx-auto size-4 text-success" aria-label="Permitido" />
                        ) : (
                          <Minus className="mx-auto size-4 text-line-strong" aria-label="Sem acesso" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <UserDialog open={dialogOpen} onClose={() => setDialogOpen(false)} user={editing} />
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir usuário?"
        description={`${toDelete?.name} perderá o acesso ao painel.`}
        onConfirm={async () => {
          if (toDelete) await userService.remove(toDelete.id);
          toast.success("Usuário excluído");
        }}
      />
    </div>
  );
}
