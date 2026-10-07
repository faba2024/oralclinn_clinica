import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

const fieldBase =
  "w-full rounded-[10px] border border-line bg-white text-sm text-ink placeholder:text-subtle shadow-[0_1px_2px_rgba(32,32,32,0.03)] transition-[border,box-shadow] duration-150 hover:border-line-strong focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/12 disabled:cursor-not-allowed disabled:bg-sand disabled:opacity-70 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/10";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, leading, trailing, ...props }, ref) => {
  if (!leading && !trailing) return <input ref={ref} className={cn(fieldBase, "h-9 px-3", className)} {...props} />;
  return (
    <div className="relative">
      {leading ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-subtle [&_svg]:size-4">{leading}</span>
      ) : null}
      <input ref={ref} className={cn(fieldBase, "h-9 px-3", leading && "pl-9", trailing && "pr-9", className)} {...props} />
      {trailing ? <span className="absolute inset-y-0 right-2.5 flex items-center text-subtle">{trailing}</span> : null}
    </div>
  );
});
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, rows = 3, ...props }, ref) => (
    <textarea ref={ref} rows={rows} className={cn(fieldBase, "min-h-20 resize-y px-3 py-2 leading-relaxed", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select ref={ref} className={cn(fieldBase, "h-9 appearance-none pl-3 pr-9", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden />
    </div>
  ),
);
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[13px] font-medium text-ink-2", className)} {...props} />;
}

interface FieldProps {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <Label htmlFor={htmlFor}>
          {label}
          {required ? <span className="ml-0.5 text-gold-dark" aria-hidden>*</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}
