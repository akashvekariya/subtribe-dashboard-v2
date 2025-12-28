"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resendVerificationEmail } from "@/lib/auth";
import { APIError } from "@/lib/api-client";
import showToast from "@/lib/toast";
import { Button } from "@/components/ui/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  async function handleResend() {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    const toastId = showToast.loading("Sending verification email...");

    try {
      await resendVerificationEmail(email);
      showToast.dismiss(toastId);
      showToast.success("Verification email sent! Check your inbox.");

      // Start 60 second cooldown
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      showToast.dismiss(toastId);
      if (error instanceof APIError) {
        showToast.error(error.message);
      } else {
        showToast.error("Failed to send verification email. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          {/* Email icon */}
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We&apos;ve sent a verification link to
          </p>
          {email && (
            <p className="mt-1 text-sm font-medium text-gray-900">{email}</p>
          )}
          <p className="mt-4 text-sm text-gray-600">
            Click the link in the email to verify your account. The link will
            expire in 24 hours.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0 || !email}
            variant="outline"
            className="w-full"
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend verification email"}
          </Button>

          <div className="text-sm text-gray-600">
            <p>
              Wrong email?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up again
              </Link>
            </p>
          </div>

          <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
            <p>
              Already verified?{" "}
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
