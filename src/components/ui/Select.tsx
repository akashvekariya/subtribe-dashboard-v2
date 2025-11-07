import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

/**
 * Standardized Select component
 * - Matches Input and Textarea component styling exactly
 * - Uses design tokens from globals.css
 * - Consistent focus states with primary color
 * - Proper error state styling
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, hasError, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex w-full h-11 border transition-all appearance-none bg-no-repeat",
          "focus:outline-none focus:ring-[3px] focus:border-[var(--color-primary)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "cursor-pointer",
          hasError
            ? "border-[var(--color-error)] focus:ring-red-100"
            : "border-[var(--color-border-input)] focus:ring-[var(--focus-ring)]",
          className
        )}
        style={{
          paddingLeft: "var(--input-padding-x)",
          paddingRight: "calc(var(--input-padding-x) + 24px)",
          paddingTop: "var(--input-padding-y)",
          paddingBottom: "var(--input-padding-y)",
          backgroundColor: "var(--color-bg-base)",
          color: "var(--color-text-primary)",
          borderRadius: "var(--input-border-radius)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: "right 12px center",
          backgroundSize: "20px 20px",
        }}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export { Select };
