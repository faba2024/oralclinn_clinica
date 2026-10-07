"use client";

import { Database, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useSessionUser } from "@/features/users/hooks";

interface Health {
  ok: boolean;
  storage: { kind: "supabase" | "file" | "none"; persistent: boolean; message: string };
}

/** Estado do banco de dados compartilhado entre site e painel. */
export function DatabaseCard({ onReset }: { onReset: () => void }) {
  const user = useSessionUser();
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json())
      .then((h: Health) => active && setHealth(h))
      .catch(() => active && setHealth(null));
    return () => {
      active = false;
    };
  }, []);

  const label = health?.storage.kind === "supabase" ? "Supabase" : health?.storage.kind === "file" ? "Arquivo local (.data)" : "Não configurado";

  return (
    <Card className="mt-8">
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
          <Database className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold">
            Banco de dados
            {health ? (
              <Badge tone={health.ok ? "success" : "danger"} dot>
                {health.ok ? `Conectado · ${label}` : label}
              </Badge>
            ) : null}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">
            {health?.storage.message ??
              "Site e painel usam o mesmo banco: agendamentos e contatos feitos no site aparecem aqui imediatamente."}
          </p>
        </div>
        {user?.role === "admin" ? (
          <Button variant="danger-ghost" onClick={onReset}>
            <RotateCcw /> Restaurar dados iniciais
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}
