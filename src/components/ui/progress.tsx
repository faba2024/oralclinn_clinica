import { cn } from "@/utils/cn";

export function Progress({ value, className, tone = "gold" }: { value: number; className?: string; tone?: "gold" | "ink" | "success" }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-sand-2", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", tone === "gold" ? "bg-gold" : tone === "success" ? "bg-success" : "bg-ink")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
