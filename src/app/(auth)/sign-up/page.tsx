"use client";

import React, { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signUpSchema, type SignUpInput } from "@/lib/validations";
import { registerUser } from "@/lib/auth";
import { APIError } from "@/lib/api-client";
import showToast from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/shared/FormField";

function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(data: SignUpInput) {
    const toastId = showToast.loading("Creating your account...");

    try {
      const user = await registerUser({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        company_code: data.company_code,
      });

      if (!user) {
        showToast.dismiss(toastId);
        showToast.error("Registration failed. Please try again.");
        return;
      }

      showToast.dismiss(toastId);
      showToast.success(
        `Welcome, ${user.first_name}! Your account has been created.`
      );

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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join your team on Subtribe ATS
          </p>

          {/* Development company code info - only in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800 font-medium">
                Test Company Code:
              </p>
              <p className="text-xs text-blue-700">DJIS938DJA9</p>
            </div>
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
              id="company_code"
              label="Company Code"
              type="text"
              placeholder="Enter your company invitation code"
              required
              error={errors.company_code?.message}
              {...register("company_code")}
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
      <SignUpForm />
    </Suspense>
  );
}
