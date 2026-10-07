"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/input";
import { toast } from "@/stores/toast-store";
import { authService } from "../service";

/** Troca da própria senha (verifica a senha atual no servidor). */
export function ChangePasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCurrent("");
    setNext("");
    setConfirm("");
    setError(null);
  }, [open]);

  const save = async () => {
    setError(null);
    if (!current) return setError("Informe a senha atual.");
    if (next.length < 8) return setError("A nova senha deve ter pelo menos 8 caracteres.");
    if (!/[A-Za-z]/.test(next) || !/\d/.test(next)) return setError("Use letras e números na nova senha.");
    if (next !== confirm) return setError("A confirmação não confere com a nova senha.");
    setSaving(true);
    try {
      await authService.changePassword(current, next);
      toast.success("Senha alterada");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível alterar a senha.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Alterar minha senha"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} loading={saving}>
            Salvar nova senha
          </Button>
        </>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <Field label="Senha atual" htmlFor="pw-current">
          <Input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
        <Field label="Nova senha" htmlFor="pw-new" hint="Mínimo de 8 caracteres, com letras e números.">
          <Input id="pw-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Field label="Confirmar nova senha" htmlFor="pw-confirm">
          <Input id="pw-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        {error ? (
          <p role="alert" className="rounded-[10px] bg-danger-soft px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        ) : null}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Dialog>
  );
}
