import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  trend?: { value: number; positiveIsGood?: boolean } | null;
  loading?: boolean;
  className?: string;
  emphasis?: boolean;
}

export function StatCard({ label, value, hint, icon, trend, loading, className, emphasis }: StatCardProps) {
  const good = trend ? (trend.positiveIsGood === false ? trend.value <= 0 : trend.value >= 0) : true;
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[14px] border p-4 transition-shadow duration-200 sm:p-5",
        emphasis ? "border-ink bg-ink text-white" : "border-line bg-white shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-[12.5px] font-medium", emphasis ? "text-white/60" : "text-muted")}>{label}</p>
        {icon ? (
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-lg [&_svg]:size-3.5",
              emphasis ? "bg-white/10 text-champagne" : "bg-ivory text-gold-dark ring-1 ring-line",
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-24" />
      ) : (
        <p className={cn("mt-2 whitespace-nowrap text-[19px] font-semibold tracking-[-0.02em] tabular sm:text-[22px] 2xl:text-2xl", emphasis ? "text-white" : "text-ink")}>
          {value}
        </p>
      )}
      <div className="mt-1.5 flex items-center gap-2 text-[12px]">
        {trend ? (
          <span className={cn("inline-flex items-center gap-0.5 font-medium", good ? "text-success" : "text-danger", emphasis && (good ? "text-[#9fd3ab]" : "text-[#f0a79e]"))}>
            {trend.value >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(Math.round(trend.value * 100))}%
          </span>
        ) : null}
        {hint ? <span className={emphasis ? "text-white/50" : "text-subtle"}>{hint}</span> : null}
      </div>
    </div>
  );
}
