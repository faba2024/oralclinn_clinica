"use client";

import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, label, description, id, disabled, className }: CheckboxProps) {
  return (
    <label className={cn("group flex cursor-pointer items-start gap-2.5 text-sm", disabled && "cursor-not-allowed opacity-60", className)}>
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:ring-offset-1",
          checked ? "border-ink bg-ink text-white" : "border-line-strong bg-white group-hover:border-subtle",
        )}
      >
        {checked ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
      {label ? (
        <span className="leading-snug">
          <span className="text-ink">{label}</span>
          {description ? <span className="block text-xs text-subtle">{description}</span> : null}
        </span>
      ) : null}
    </label>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Switch({ checked, onChange, label, description, disabled, id }: SwitchProps) {
  const control = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50",
        checked ? "bg-ink" : "bg-line-strong",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
  if (!label) return control;
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {description ? <p className="mt-0.5 text-xs leading-relaxed text-subtle">{description}</p> : null}
      </div>
      {control}
    </div>
  );
}
