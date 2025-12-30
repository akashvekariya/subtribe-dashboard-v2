"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations";
import { authAPI, APIError } from "@/lib/api-client";
import showToast from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/shared/FormField";
import { PasswordField } from "@/components/shared/PasswordField";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  // Password match validation
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  useEffect(() => {
    async function validateToken() {
      try {
        const result = await authAPI.validateResetToken(token);

        if (result.valid) {
          setIsValidToken(true);
          setMaskedEmail(result.email || null);
        } else {
          setIsValidToken(false);
          setErrorMessage(result.message || "Invalid or expired reset link");
        }
      } catch (error) {
        setIsValidToken(false);
        if (error instanceof APIError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Failed to validate reset link. Please try again.");
        }
      } finally {
        setIsValidating(false);
      }
    }

    if (token) {
      validateToken();
    } else {
      setIsValidating(false);
      setErrorMessage("No reset token provided");
    }
  }, [token]);

  async function onSubmit(data: ResetPasswordInput) {
    const toastId = showToast.loading("Resetting password...");

    try {
      await authAPI.resetPassword(token, data.password, data.confirmPassword);

      showToast.dismiss(toastId);
      showToast.success("Password reset successfully!");
      setIsSuccess(true);

      // Redirect to sign-in after 3 seconds
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
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
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 px-4">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-4 text-gray-600">
              {errorMessage ||
                "This password reset link is invalid or has expired."}
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/forgot-password">
              <Button className="w-full">Request a new reset link</Button>
            </Link>

            <div className="text-center">
              <Link
                href="/sign-in"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 px-4">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Password Reset Successfully
            </h2>
            <p className="mt-4 text-gray-600">
              Your password has been updated. You will be redirected to sign in
              shortly.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/sign-in"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset form state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 px-4">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create new password
          </h2>
          {maskedEmail && (
            <p className="mt-2 text-center text-sm text-gray-600">
              for {maskedEmail}
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <PasswordField
              id="password"
              label="New password"
              password={password}
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />

            <FormField
              id="confirmPassword"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              required
              error={
                passwordsMismatch
                  ? "Password doesn't match"
                  : errors.confirmPassword?.message
              }
              isValid={!!passwordsMatch}
              showSuccessIcon
              {...register("confirmPassword")}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset password"}
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/sign-in"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
