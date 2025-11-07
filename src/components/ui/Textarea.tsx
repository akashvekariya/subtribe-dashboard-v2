import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

/**
 * Standardized Textarea component
 * - Matches Input component styling exactly
 * - Uses design tokens from globals.css
 * - Consistent focus states with primary color
 * - Proper error state styling
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full min-h-[120px] border transition-all",
          "focus:outline-none focus:ring-[3px] focus:border-[var(--color-primary)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
          hasError
            ? "border-[var(--color-error)] focus:ring-red-100"
            : "border-[var(--color-border-input)] focus:ring-[var(--focus-ring)]",
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

Textarea.displayName = "Textarea";

export { Textarea };
