import { cn } from "@/utils/cn";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-line bg-ivory px-1 font-sans text-[10.5px] font-medium text-subtle shadow-[0_1px_0_var(--color-line)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
