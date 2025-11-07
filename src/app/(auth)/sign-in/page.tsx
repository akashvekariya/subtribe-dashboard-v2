"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signInSchema, type SignInInput } from "@/lib/validations";
import { authenticateUser } from "@/lib/auth";
import { APIError } from "@/lib/api-client";
import showToast from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/shared/FormField";

export default function SignInPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(data: SignInInput) {
    const toastId = showToast.loading("Signing in...");

    try {
      const user = await authenticateUser(data.email, data.password);

      if (!user) {
        showToast.dismiss(toastId);
        showToast.error("Login failed - no user returned");
        return;
      }

      showToast.dismiss(toastId);
      showToast.success(`Welcome back, ${user.first_name}!`);

      window.location.href = "/";
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your recruitment dashboard
          </p>

          {/* Development credentials info - only in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800 font-medium">Test Account:</p>
              <p className="text-xs text-blue-700">
                akash@thesubtribe.com / Test@1234
              </p>
            </div>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Have an invite?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Accept invitation
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
