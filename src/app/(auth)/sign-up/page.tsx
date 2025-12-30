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
import { PasswordField } from "@/components/shared/PasswordField";

// New flow: Users sign up freely, then enter invite code after email verification
// The invite code is entered on /claim-invite page, not during sign-up

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
  const confirmPassword = watch("confirmPassword", "");

  // Password match validation
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

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

            <PasswordField
              id="password"
              label="Password"
              password={password}
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />

            <FormField
              id="confirmPassword"
              label="Confirm password"
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
