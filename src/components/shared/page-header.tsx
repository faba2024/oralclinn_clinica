import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: Crumb[];
  className?: string;
}

export function PageHeader({ title, description, actions, breadcrumb, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="min-w-0">
        {breadcrumb ? (
          <div className="mb-2">
            <Breadcrumb items={breadcrumb} />
          </div>
        ) : null}
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
