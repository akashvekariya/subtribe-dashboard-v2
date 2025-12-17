"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI, APIError } from "@/lib/api-client";
import showToast from "@/lib/toast";
import { Button } from "@/components/ui/Button";

// Storage key for invite code (shared with /invite/[code] page)
const INVITE_CODE_STORAGE_KEY = "subtribe-pending-invite-code";

export default function ClaimInvitePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPrefilledCode, setHasPrefilledCode] = useState(false);

  // Check for stored invite code on mount
  useEffect(() => {
    const storedCode = sessionStorage.getItem(INVITE_CODE_STORAGE_KEY);
    if (storedCode && !code) {
      setCode(storedCode);
      setHasPrefilledCode(true);
      // Clear the stored code after using it
      sessionStorage.removeItem(INVITE_CODE_STORAGE_KEY);
    }
  }, [code]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!code.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authAPI.claimInvite(code.trim());

      if (response.success) {
        // Store new token with updated company_id
        if (response.access_token) {
          localStorage.setItem("subtribe-token", response.access_token);
        }

        showToast.success(response.message || "Invite claimed successfully!");

        // Redirect based on invite type
        if (response.redirect_to) {
          router.push(response.redirect_to);
        } else if (response.invite_type === "org_creator") {
          router.push("/onboarding");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      if (err instanceof APIError) {
        // Map error codes to user-friendly messages
        switch (err.code) {
          case "invalid_invite":
            setError(
              "Invalid invite code. Please check the code and try again."
            );
            break;
          case "invite_expired":
            setError("This invite code has expired. Please request a new one.");
            break;
          case "invite_maxed":
            setError(
              "This invite code has reached its maximum uses. Please request a new one."
            );
            break;
          case "invite_inactive":
            setError("This invite code is no longer active.");
            break;
          case "already_has_company":
            setError("You are already part of an organization.");
            break;
          case "email_mismatch":
            setError("Invalid Invite Code");
            break;
          default:
            setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Format code as user types (XXXXX-XXXXX)
  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");

    // Auto-add hyphen after 5 characters
    if (value.length === 5 && !value.includes("-")) {
      value = value + "-";
    }

    // Limit to 11 characters (XXXXX-XXXXX)
    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    setCode(value);
    setError(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center px-4">
        <div>
          {/* Key/ticket icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100">
            <svg
              className="h-8 w-8 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Enter Invite Code
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your invite code to join an organization or create your own.
          </p>
        </div>

        {hasPrefilledCode && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Invite code from your link has been applied. Click Continue to
                  proceed.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="code" className="sr-only">
              Invite Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="XXXXX-XXXXX"
              className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${
                error ? "border-red-300" : "border-gray-300"
              } placeholder-gray-400 text-gray-900 text-center text-xl font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
              disabled={isSubmitting}
              autoComplete="off"
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !code.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? "Verifying..." : "Continue"}
          </Button>
        </form>

        <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
          <p>
            Don&apos;t have an invite code?{" "}
            <span className="text-gray-500">
              Contact someone from the organization you want to join.
            </span>
          </p>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            Need to sign out?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-purple-600 hover:text-purple-500"
              onClick={() => {
                // Clear auth state
                if (typeof document !== "undefined") {
                  document.cookie =
                    "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
                }
                localStorage.removeItem("subtribe-token");
                localStorage.removeItem("subtribe-user");
              }}
            >
              Sign out
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
