"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations";
import { authAPI, APIError } from "@/lib/api-client";
import showToast from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/shared/FormField";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    const toastId = showToast.loading("Sending reset link...");

    try {
      await authAPI.forgotPassword(data.email);

      showToast.dismiss(toastId);
      showToast.success("Check your email for the reset link");
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      showToast.dismiss(toastId);

      if (error instanceof APIError) {
        showToast.error(error.message);
      } else {
        showToast.error("An unexpected error occurred. Please try again.");
      }
    }
  }

  if (isSubmitted) {
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
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <p className="mt-4 text-gray-600">
              If an account exists for <strong>{submittedEmail}</strong>, we
              have sent a password reset link.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              The link will expire in 1 hour.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-center text-sm text-gray-500">
              Did not receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setIsSubmitted(false)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                try again
              </button>
            </p>

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 px-4">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we will send you a link to reset your
            password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <FormField
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />

          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
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
