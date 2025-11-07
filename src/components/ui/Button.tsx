import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button variant definitions
 * - Consistent heights with input fields (44px)
 * - Rounded corners with smooth transitions
 * - Multiple variants for different use cases
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-white hover:opacity-90 active:opacity-80",
        destructive:
          "bg-[var(--color-error)] text-white hover:opacity-90 active:opacity-80",
        outline:
          "bg-transparent text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white active:opacity-80",
        secondary:
          "bg-[var(--color-bg-surface)] text-[var(--color-primary)] border border-[var(--color-border-input)] hover:bg-gray-50 active:bg-gray-100",
        ghost:
          "bg-transparent text-[var(--color-primary)] hover:bg-gray-100 active:bg-gray-200",
        link: "bg-transparent text-[var(--color-primary)] underline-offset-4 hover:underline hover:opacity-80 active:opacity-60",
        pill: "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:scale-105 active:scale-100 rounded-full",
      },
      size: {
        default: "h-11 px-6 text-[15px]",
        xs: "h-7 px-2.5 text-xs",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Apply smooth corner radius to all non-pill variants
    const buttonStyle =
      variant !== "pill"
        ? {
            borderRadius: "var(--button-border-radius)",
            ...style,
          }
        : style;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={buttonStyle}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
