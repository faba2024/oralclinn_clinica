import type { HTMLAttributes } from "react";
import type { Tone } from "@/types/common";
import { cn } from "@/utils/cn";

const tones: Record<Tone, string> = {
  neutral: "bg-sand text-ink-2 ring-line",
  gold: "bg-gold-soft text-gold-dark ring-champagne/60",
  success: "bg-success-soft text-success ring-success/15",
  warning: "bg-warning-soft text-warning ring-warning/20",
  danger: "bg-danger-soft text-danger ring-danger/15",
  info: "bg-info-soft text-info ring-info/15",
};

const dots: Record<Tone, string> = {
  neutral: "bg-subtle",
  gold: "bg-gold",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

export function Badge({ tone = "neutral", dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-[11.5px] font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", dots[tone])} aria-hidden /> : null}
      {children}
    </span>
  );
}
