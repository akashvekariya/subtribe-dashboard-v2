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

// Schema for invite registration (no invite_token field needed in form)
const inviteSignUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type InviteSignUpInput = z.infer<typeof inviteSignUpSchema>;

type PageState = "loading" | "valid" | "invalid" | "expired" | "used";

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
    formState: { errors, isSubmitting },
  } = useForm<InviteSignUpInput>({
    resolver: zodResolver(inviteSignUpSchema),
  });

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

            <FormField
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              error={errors.password?.message}
              {...register("password")}
            />

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
