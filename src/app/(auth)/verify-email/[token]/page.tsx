"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "@/lib/auth";
import { APIError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";

type VerificationState = "loading" | "success" | "error" | "expired";

export default function VerifyEmailTokenPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [state, setState] = useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMessage("Invalid verification link");
      return;
    }

    async function verify() {
      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setState("success");
        } else {
          setState("error");
          setErrorMessage(result.message || "Verification failed");
        }
      } catch (error) {
        if (error instanceof APIError) {
          if (error.code === "token_expired") {
            setState("expired");
          } else {
            setState("error");
            setErrorMessage(error.message);
          }
        } else {
          setState("error");
          setErrorMessage("An unexpected error occurred");
        }
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        {state === "loading" && (
          <div>
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
              Verifying your email...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        )}

        {state === "success" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email verified!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your email has been successfully verified. You can now sign in to
              your account.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push("/sign-in")}
                className="w-full"
              >
                Sign in to continue
              </Button>
            </div>
          </div>
        )}

        {state === "expired" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
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
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Link expired
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This verification link has expired. Please request a new one.
            </p>
            <div className="mt-6 space-y-4">
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  Sign in to resend verification
                </Button>
              </Link>
            </div>
          </div>
        )}

        {state === "error" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
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
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verification failed
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {errorMessage || "Unable to verify your email address."}
            </p>
            <div className="mt-6 space-y-4">
              <Link href="/sign-up">
                <Button variant="outline" className="w-full">
                  Sign up again
                </Button>
              </Link>
              <div className="text-sm text-gray-600">
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
        )}
      </div>
    </div>
  );
}
