import React from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  isValid?: boolean;
  showSuccessIcon?: boolean;
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
  isValid,
  showSuccessIcon,
  className,
  ...props
}: FormFieldProps) {
  const errorId = error && props.id ? `${props.id}-error` : undefined;
  const helperId = helperText && props.id ? `${props.id}-helper` : undefined;
  const describedBy =
    [errorId, helperId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 mb-2">
        <Label
          htmlFor={props.id}
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
        {showSuccessIcon && isValid && (
          <svg
            className="h-4 w-4 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <Input
        hasError={!!error}
        isValid={isValid}
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
