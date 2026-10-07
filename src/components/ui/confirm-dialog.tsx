"use client";

import { useState } from "react";
import { Button } from "./button";
import { Dialog } from "./dialog";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Excluir",
  tone = "danger",
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            loading={loading}
            data-autofocus
            onClick={async () => {
              setLoading(true);
              try {
                await onConfirm();
                onClose();
              } finally {
                setLoading(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted">{description}</p>
    </Dialog>
  );
}
