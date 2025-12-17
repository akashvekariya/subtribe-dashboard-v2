import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  isValid?: boolean;
}

/**
 * Standardized Input component
 * - Consistent height (44px) across all input types
 * - Uses design tokens from globals.css
 * - Consistent focus states with primary color
 * - Proper error state styling
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, isValid, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full h-11 border transition-all",
          "file:border-0 file:bg-transparent file:font-medium",
          "focus:outline-none focus:ring-[3px]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
          hasError
            ? "border-[var(--color-error)] focus:ring-red-100 focus:border-[var(--color-error)]"
            : isValid
              ? "border-green-500 focus:ring-green-100 focus:border-green-500"
              : "border-[var(--color-border-input)] focus:ring-[var(--focus-ring)] focus:border-[var(--color-primary)]",
          className
        )}
        style={{
          paddingLeft: "var(--input-padding-x)",
          paddingRight: "var(--input-padding-x)",
          paddingTop: "var(--input-padding-y)",
          paddingBottom: "var(--input-padding-y)",
          backgroundColor: "var(--color-bg-base)",
          color: "var(--color-text-primary)",
          borderRadius: "var(--input-border-radius)",
        }}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
