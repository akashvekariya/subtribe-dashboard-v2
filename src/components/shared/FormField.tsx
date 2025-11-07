import React from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

/**
 * Standardized FormField component
 * - Consistent label styling (14px, medium weight)
 * - Consistent error text (12px with 6px top margin)
 * - Passes hasError prop to Input component
 * - Optional helper text for additional guidance
 */
export function FormField({
  label,
  error,
  required,
  helperText,
  className,
  ...props
}: FormFieldProps) {
  const errorId = error && props.id ? `${props.id}-error` : undefined;
  const helperId = helperText && props.id ? `${props.id}-helper` : undefined;
  const describedBy =
    [errorId, helperId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col">
      <Label
        htmlFor={props.id}
        className="mb-2"
        style={{
          fontSize: "var(--label-font-size)",
          fontWeight: "var(--label-font-weight)",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--color-error)" }} className="ml-1">
            *
          </span>
        )}
      </Label>
      <Input
        hasError={!!error}
        className={className}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        aria-required={required}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs mt-1.5"
          style={{
            color: "var(--color-error)",
            fontSize: "var(--error-font-size)",
            marginTop: "var(--error-margin-top)",
          }}
        >
          {error}
        </p>
      )}
      {!error && helperText && (
        <p
          id={helperId}
          className="text-xs mt-1.5"
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--error-font-size)",
            marginTop: "var(--error-margin-top)",
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
