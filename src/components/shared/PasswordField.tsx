import React from "react";
import { Input, type InputProps } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Password validation checks
export function checkPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

function PasswordRequirementItem({
  met,
  text,
}: {
  met: boolean;
  text: string;
}) {
  return (
    <li className={`flex items-center gap-1.5 ${met ? "text-green-600" : ""}`}>
      {met ? (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="3" />
        </svg>
      )}
      {text}
    </li>
  );
}

interface PasswordFieldProps extends Omit<InputProps, "type"> {
  label?: string;
  password: string;
  error?: string;
}

/**
 * Password input field with requirements tooltip
 * Shows a tooltip with password requirements and a checkmark when all are met
 */
export const PasswordField = React.forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(({ label = "Password", password, error, id = "password", ...props }, ref) => {
  const requirements = checkPasswordRequirements(password);
  const allRequirementsMet = Object.values(requirements).every(Boolean);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 mb-2">
        <Label
          htmlFor={id}
          style={{
            fontSize: "var(--label-font-size)",
            fontWeight: "var(--label-font-weight)",
          }}
        >
          {label}
          <span style={{ color: "var(--color-error)" }} className="ml-1">
            *
          </span>
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="text-gray-400 hover:text-gray-600">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-gray-900 text-white p-3 max-w-xs"
          >
            <p className="font-medium mb-1">Password requirements:</p>
            <ul className="text-xs space-y-0.5">
              <PasswordRequirementItem
                met={requirements.minLength}
                text="At least 8 characters"
              />
              <PasswordRequirementItem
                met={requirements.hasUppercase}
                text="One uppercase letter (A-Z)"
              />
              <PasswordRequirementItem
                met={requirements.hasNumber}
                text="One number (0-9)"
              />
              <PasswordRequirementItem
                met={requirements.hasSpecial}
                text="One special character (!@#$%^&*...)"
              />
            </ul>
          </TooltipContent>
        </Tooltip>
        {allRequirementsMet && (
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
        ref={ref}
        id={id}
        type="password"
        hasError={!!error}
        isValid={allRequirementsMet}
        {...props}
      />
      {error && (
        <p
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
    </div>
  );
});

PasswordField.displayName = "PasswordField";
