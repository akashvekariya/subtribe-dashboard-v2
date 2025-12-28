import * as React from "react";
import { cn } from "@/lib/utils";

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

/**
 * Standardized NativeSelect component
 * - Matches Input component styling exactly
 * - Works with react-hook-form register()
 * - Uses design tokens from globals.css
 * - Consistent focus states with primary color
 * - Proper error state styling
 */
const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex w-full h-11 border transition-all",
          "focus:outline-none focus:ring-[3px]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError
            ? "border-[var(--color-error)] focus:ring-red-100 focus:border-[var(--color-error)]"
            : "border-[var(--color-border-input)] focus:ring-[var(--focus-ring)] focus:border-[var(--color-primary)]",
          className
        )}
        style={{
          paddingLeft: "var(--input-padding-x)",
          paddingRight: "var(--input-padding-x)",
          backgroundColor: "var(--color-bg-base)",
          color: "var(--color-text-primary)",
          borderRadius: "var(--input-border-radius)",
        }}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
