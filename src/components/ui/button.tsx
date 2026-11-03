import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 rounded-ctl select-none",
  {
    variants: {
      variant: {
        primary: "bg-gold text-ink hover:bg-gold-strong",
        dark: "bg-ink text-cream hover:bg-[#1f2227]",
        outline: "border border-line bg-paper text-ink hover:bg-butter-soft hover:border-gold",
        soft: "bg-butter text-ink hover:bg-[#ffeba5]",
        ghost: "text-ink hover:bg-butter",
        danger: "bg-bad text-white hover:bg-[#962b24]",
        dangerSoft: "bg-bad-bg text-bad hover:bg-[#f6d3ce]",
      },
      size: { sm: "h-9 px-3 text-sm", md: "h-11 px-4 text-sm", lg: "h-12 px-6 text-base", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { loading?: boolean }
export const Button = forwardRef<HTMLButtonElement, Props>(({ className, variant, size, loading, children, disabled, type = "button", ...p }, ref) => (
  <button ref={ref} type={type} disabled={disabled || loading} className={cn(buttonVariants({ variant, size }), className)} {...p}>
    {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
    {children}
  </button>
));
Button.displayName = "Button";
