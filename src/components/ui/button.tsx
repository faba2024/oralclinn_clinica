import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

const buttonStyles = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium transition-[background,color,border,box-shadow,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-ink text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_1px_2px_rgba(0,0,0,0.2)] hover:bg-ink-2",
        gold: "bg-gold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_1px_2px_rgba(0,0,0,0.12)] hover:bg-gold-dark",
        secondary: "border border-line bg-white text-ink shadow-[0_1px_2px_rgba(32,32,32,0.04)] hover:border-line-strong hover:bg-ivory",
        ghost: "text-ink-2 hover:bg-sand",
        subtle: "bg-sand text-ink hover:bg-sand-2",
        danger: "bg-danger text-white hover:bg-[#923c33]",
        "danger-ghost": "text-danger hover:bg-danger-soft",
        link: "h-auto px-0 text-gold-dark underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-8 px-3 text-[13px]",
        md: "h-9 px-3.5 text-sm",
        lg: "h-11 px-5 text-[15px]",
        xl: "h-12 px-6 text-[15px]",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-7 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

/** Classes do botão com resolução de conflitos (permite sobrescrever via className). */
export function buttonVariants(options?: Parameters<typeof buttonStyles>[0]) {
  return cn(buttonStyles(options));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonStyles({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
