"use client";

import React, { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpSchema, type SignUpInput } from "@/lib/validations";
import { registerUser } from "@/lib/auth";
import { APIError } from "@/lib/api-client";
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

// New flow: Users sign up freely, then enter invite code after email verification
// The invite code is entered on /claim-invite page, not during sign-up

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

function RegistrationForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const password = watch("password", "");
  const requirements = checkPasswordRequirements(password);
  const allRequirementsMet = Object.values(requirements).every(Boolean);

  async function onSubmit(data: SignUpInput) {
    const toastId = showToast.loading("Creating your account...");

    try {
      const user = await registerUser({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
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

      // Redirect to verify-email page with email in query params
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start your recruiting journey with Subtribe
          </p>
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
              {isSubmitting ? "Creating account..." : "Create account"}
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

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <RegistrationForm />
    </Suspense>
  );
}
