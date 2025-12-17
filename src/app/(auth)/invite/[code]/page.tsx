"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
import { api, APIError, InviteValidationResponse } from "@/lib/api-client";
import { registerUser } from "@/lib/auth";
import showToast from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Password validation matching backend requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
  .regex(/\d/, "Password must contain at least one number (0-9)")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character (!@#$%^&*...)"
  );

// Schema for invite registration (no invite_token field needed in form)
const inviteSignUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type InviteSignUpInput = z.infer<typeof inviteSignUpSchema>;

type PageState = "loading" | "valid" | "invalid" | "expired" | "used";

// Password validation checks
function checkPasswordRequirements(password: string) {
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

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [inviteData, setInviteData] = useState<InviteValidationResponse | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InviteSignUpInput>({
    resolver: zodResolver(inviteSignUpSchema),
  });

  const password = watch("password", "");
  const requirements = checkPasswordRequirements(password);
  const allRequirementsMet = Object.values(requirements).every(Boolean);

  useEffect(() => {
    if (!code) {
      setPageState("invalid");
      setErrorMessage("Invalid invite link");
      return;
    }

    async function validateInvite() {
      try {
        const result = await api.invites.validate(code);

        if (result.valid) {
          setInviteData(result);
          setPageState("valid");
        } else {
          switch (result.error) {
            case "not_found":
              setPageState("invalid");
              setErrorMessage("This invite link is not valid.");
              break;
            case "expired":
              setPageState("expired");
              setErrorMessage("This invite link has expired.");
              break;
            case "maxed_out":
              setPageState("used");
              setErrorMessage("This invite link has already been used.");
              break;
            case "inactive":
              setPageState("invalid");
              setErrorMessage("This invite link has been deactivated.");
              break;
            default:
              setPageState("invalid");
              setErrorMessage("This invite link is not valid.");
          }
        }
      } catch (error) {
        setPageState("invalid");
        if (error instanceof APIError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Failed to validate invite. Please try again.");
        }
      }
    }

    validateInvite();
  }, [code]);

  async function onSubmit(data: InviteSignUpInput) {
    const toastId = showToast.loading("Creating your account...");

    try {
      const user = await registerUser({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        invite_token: code,
      });

      if (!user) {
        showToast.dismiss(toastId);
        showToast.error("Registration failed. Please try again.");
        return;
      }

      showToast.dismiss(toastId);
      showToast.success(
        "Account created! Please check your email to verify your account."
      );

      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      showToast.dismiss(toastId);

      if (error instanceof APIError) {
        showToast.error(error.message);
      } else {
        showToast.error("An unexpected error occurred. Please try again.");
      }
    }
  }

  // Loading state
  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Validating invite...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we verify your invitation.
          </p>
        </div>
      </div>
    );
  }

  // Invalid/Expired/Used states
  if (pageState !== "valid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div
            className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
              pageState === "expired" ? "bg-yellow-100" : "bg-red-100"
            }`}
          >
            {pageState === "expired" ? (
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {pageState === "expired"
              ? "Invite expired"
              : pageState === "used"
                ? "Invite already used"
                : "Invalid invite"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">
              Please contact your team admin for a new invitation.
            </p>
            <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
              <p>
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Valid invite - show registration form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Company logo if available */}
          {inviteData?.company_logo ? (
            <img
              src={inviteData.company_logo}
              alt={inviteData.company_name || "Company"}
              className="mx-auto h-16 w-auto object-contain"
            />
          ) : (
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          )}

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join {inviteData?.company_name || "the team"}
          </h2>
          {inviteData?.inviter_name && (
            <p className="mt-2 text-sm text-gray-600">
              {inviteData.inviter_name} invited you to join as a{" "}
              <span className="font-medium">{inviteData.role || "member"}</span>
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="first_name"
                label="First name"
                type="text"
                autoComplete="given-name"
                required
                error={errors.first_name?.message}
                {...register("first_name")}
              />

              <FormField
                id="last_name"
                label="Last name"
                type="text"
                autoComplete="family-name"
                required
                error={errors.last_name?.message}
                {...register("last_name")}
              />
            </div>

            <FormField
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="flex flex-col">
              <div className="flex items-center gap-1 mb-2">
                <Label
                  htmlFor="password"
                  style={{
                    fontSize: "var(--label-font-size)",
                    fontWeight: "var(--label-font-weight)",
                  }}
                >
                  Password
                  <span
                    style={{ color: "var(--color-error)" }}
                    className="ml-1"
                  >
                    *
                  </span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                    >
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
                {allRequirementsMet && password && (
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
                id="password"
                type="password"
                autoComplete="new-password"
                hasError={!!errors.password}
                isValid={allRequirementsMet && !!password}
                {...register("password")}
              />
              {errors.password && (
                <p
                  className="text-xs mt-1.5"
                  style={{
                    color: "var(--color-error)",
                    fontSize: "var(--error-font-size)",
                    marginTop: "var(--error-margin-top)",
                  }}
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <FormField
              id="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Join team"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
