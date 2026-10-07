import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "px-4 py-8" : "px-6 py-14", className)}>
      {icon ? (
        <div className="mb-4 flex size-11 items-center justify-center rounded-full border border-line bg-ivory text-gold-dark [&_svg]:size-5">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
